import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

// إرسال إشعارات لكل من لديه صلاحية عرض أو تعديل صفحة المبيعات (بالإضافة إلى مديري النظام)
const notifySalesPermitted = async (
  actorId: string | undefined,
  title: string,
  message: string,
  type: string = 'info'
) => {
  try {
    const recipientIds = new Set<string>();

    // مستخدمون لديهم صلاحية عرض أو تعديل المبيعات
    const { data: perms } = await supabase
      .from('user_permissions')
      .select('user_id, can_view, can_edit')
      .eq('page_name', 'sales');
    perms?.forEach((p: any) => {
      if (p.can_view || p.can_edit) recipientIds.add(p.user_id);
    });

    // مديرو النظام
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'مدير النظام');
    admins?.forEach((a: any) => recipientIds.add(a.user_id));

    if (actorId) recipientIds.delete(actorId);

    const rows = Array.from(recipientIds).map((uid) => ({
      user_id: uid,
      title,
      message,
      type,
    }));

    if (rows.length > 0) {
      await supabase.from('notifications').insert(rows);
    }
  } catch (err) {
    console.warn('Could not send sales notifications:', err);
  }
};

export const useSales = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      // جلب المبيعات مع بيانات المشروع والعميل المرتبط
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          projects (
            id,
            name,
            expected_completion
          ),
          customers (
            id,
            customer_name,
            customer_phone,
            customer_id_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // دمج بيانات العميل في كل عملية بيع لسهولة الوصول
      const salesWithCustomers = data?.map(sale => ({
        ...sale,
        customer_name: sale.customers?.customer_name || sale.customer_name || '',
        customer_phone: sale.customers?.customer_phone || sale.customer_phone || '',
        customer_id_number: sale.customers?.customer_id_number || sale.customer_id_number || '',
      }));
      
      return salesWithCustomers;
    },
    enabled: !!user?.id,
  });

  const createSale = useMutation({
    mutationFn: async (saleData: any) => {
      // التأكد من تحديث project_name بناءً على project_id
      if (saleData.project_id && !saleData.project_name) {
        const { data: project } = await supabase
          .from('projects')
          .select('name')
          .eq('id', saleData.project_id)
          .single();
        
        if (project) {
          saleData.project_name = project.name;
        }
      }

      // إنشاء أو تحديث بيانات العميل في جدول customers
      let customerId = null;
      if (saleData.customer_name) {
        const customerData = {
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone || null,
          customer_id_number: saleData.customer_id_number || null,
          created_by: user?.id
        };

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert([customerData])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customer.id;
      }

      // إنشاء المبيعة مع ربطها بالعميل
      const { data, error } = await supabase
        .from('sales')
        .insert([{ 
          ...saleData,
          customer_id: customerId,
          user_id: user?.id 
        }])
        .select()
        .single();
      
      if (error) throw error;

      // تحديث إحصائيات المشروع (الترايجر سيقوم بهذا تلقائياً، لكن نضيف هذا للتأكيد)
      if (saleData.project_id) {
        try {
          await supabase.rpc('update_project_stats', {
            project_id: saleData.project_id
          });
        } catch (err) {
          console.warn('Could not update project stats:', err);
        }
      }

      // إنشاء قيد محاسبي للمبيعة
      if (saleData.status === 'مباع' && saleData.price > 0) {
        try {
          await supabase.rpc('create_sale_journal_entry', {
            sale_id: data.id,
            sale_amount: saleData.price,
            customer_name: saleData.customer_name
          });
        } catch (journalError) {
          console.warn('Warning: Could not create journal entry for sale:', journalError);
        }
      }
      
      // إشعار المستخدمين أصحاب الصلاحية بالحجز/البيع الجديد
      if (saleData.status === 'محجوز' || saleData.status === 'مباع') {
        const isSold = saleData.status === 'مباع';
        await notifySalesPermitted(
          user?.id,
          isSold ? '🏠 بيع شقة جديد' : '📌 حجز شقة جديد',
          `${isSold ? 'تم بيع' : 'تم حجز'} الوحدة ${saleData.unit_number || ''} في مشروع ${saleData.project_name || ''}${saleData.customer_name ? ` - العميل: ${saleData.customer_name}` : ''}`,
          isSold ? 'success' : 'info'
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم إضافة المبيعة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة المبيعة", variant: "destructive" });
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({ id, ...saleData }: any) => {
      // التأكد من تحديث project_name بناءً على project_id
      if (saleData.project_id && !saleData.project_name) {
        const { data: project } = await supabase
          .from('projects')
          .select('name')
          .eq('id', saleData.project_id)
          .single();
        
        if (project) {
          saleData.project_name = project.name;
        }
      }

      let query = supabase
        .from('sales')
        .update(saleData)
        .eq('id', id);
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، قيد التحديث للمستخدم فقط
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;

      // إشعار المستخدمين أصحاب الصلاحية بتغيير حالة الوحدة إلى محجوز أو مباع
      if (saleData.status === 'محجوز' || saleData.status === 'مباع') {
        const isSold = saleData.status === 'مباع';
        await notifySalesPermitted(
          user?.id,
          isSold ? '🏠 تحويل إلى مبيع' : '📌 حجز شقة',
          `${isSold ? 'تم تحويل الوحدة إلى مبيع' : 'تم حجز الوحدة'} ${data?.unit_number || ''} في مشروع ${data?.project_name || ''}${data?.customer_name ? ` - العميل: ${data.customer_name}` : ''}`,
          isSold ? 'success' : 'info'
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم تحديث المبيعة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث المبيعة", variant: "destructive" });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      // جلب بيانات المبيعة قبل حذفها لتحديث إحصائيات المشروع
      const { data: sale } = await supabase
        .from('sales')
        .select('project_id')
        .eq('id', id)
        .single();

      let query = supabase
        .from('sales')
        .delete()
        .eq('id', id);
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، قيد الحذف للمستخدم فقط
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { error } = await query;
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم حذف المبيعة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف المبيعة", variant: "destructive" });
    },
  });

  return {
    sales,
    isLoading,
    createSale,
    updateSale,
    deleteSale,
  };
};