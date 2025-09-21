import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useSales = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      // جلب المبيعات مع بيانات المشروع المرتبط
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          projects (
            id,
            name,
            expected_completion
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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

      const { data, error } = await supabase
        .from('sales')
        .insert([{ ...saleData, user_id: user?.id }])
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