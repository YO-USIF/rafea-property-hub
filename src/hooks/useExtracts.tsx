import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useExtracts = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جلب اسم مدير النظام (المعتمد)
  const { data: approverName } = useQuery({
    queryKey: ['approver-name'],
    queryFn: async () => {
      // جلب user_id لمدير النظام أولاً
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'مدير النظام')
        .limit(1);
      
      if (roleData && roleData.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', roleData[0].user_id)
          .single();
        
        return profileData?.full_name || 'مدير النظام';
      }
      return 'مدير النظام';
    },
  });

  const { data: extracts = [], isLoading } = useQuery({
    queryKey: ['extracts', user?.id, isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase.from('extracts').select('*');
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // جلب أسماء المستخدمين الذين أنشأوا المستخلصات
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        return data.map(extract => ({
          ...extract,
          created_by_name: profileMap.get(extract.user_id) || 'غير معروف',
          approver_name: approverName || 'مدير النظام'
        }));
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // إنشاء مستخص جديد
  const createExtract = useMutation({
    mutationFn: async (extractData: any) => {
      // توليد قائمة تعميد الدفعات إذا كان نوع الدفع دفعات
      let installments_approvals: any[] = [];
      if (extractData.payment_type === 'دفعات' && Number(extractData.installments_count) > 1) {
        const count = Number(extractData.installments_count);
        const amt = Number(extractData.installment_amount) || 0;
        installments_approvals = Array.from({ length: count }, (_, i) => ({
          index: i + 1,
          amount: amt,
          approved: false,
          approved_at: null,
          approved_by: null,
        }));
      }

      const { data, error } = await supabase
        .from('extracts')
        .insert([{ ...extractData, installments_approvals, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;

      // إنشاء قيد محاسبي للمستخلص وخصم من المبيعات
      if (extractData.amount > 0) {
        try {
          await supabase.rpc('create_extract_journal_entry', {
            extract_id: data.id,
            extract_amount: extractData.amount,
            contractor_name: extractData.contractor_name,
            project_id: extractData.project_id
          });
        } catch (journalError) {
          console.warn('Warning: Could not create journal entry for extract:', journalError);
        }
      }

      return data;
    },
    onSuccess: () => {
      // إبطال جميع استعلامات المستخلصات لتحديث البيانات لجميع المستخدمين
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم إنشاء المستخص بنجاح وخصم المبلغ من المبيعات" });
    },
    onError: (error) => {
      console.error('Error creating extract:', error);
      toast({ title: "خطأ في إنشاء المستخص", variant: "destructive" });
    },
  });

  // تحديث مستخص
  const updateExtract = useMutation({
    mutationFn: async (extractData: any) => {
      const { id, ...updateData } = extractData;
      
      // تنظيف البيانات قبل الإرسال
      const cleanedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          cleanedData[key] = value;
        }
      }
      
      // التأكد من أن project_id هو null إذا كان غير UUID صالح
      if (cleanedData.project_id === "none" || cleanedData.project_id === "external" || cleanedData.project_id === "multiple" || cleanedData.project_id === "") {
        cleanedData.project_id = null;
      }

      // إعادة توليد قائمة تعميد الدفعات عند تغيّر نوع الدفع أو عدد الدفعات
      if (cleanedData.payment_type !== undefined || cleanedData.installments_count !== undefined) {
        const { data: current } = await supabase
          .from('extracts')
          .select('payment_type, installments_count, installment_amount, installments_approvals')
          .eq('id', id)
          .single();

        const newPaymentType = cleanedData.payment_type ?? current?.payment_type;
        const newCount = Number(cleanedData.installments_count ?? current?.installments_count ?? 1);
        const newAmt = Number(cleanedData.installment_amount ?? current?.installment_amount ?? 0);
        const prevApprovals: any[] = Array.isArray((current as any)?.installments_approvals) ? (current as any).installments_approvals : [];

        if (newPaymentType === 'دفعات' && newCount > 1) {
          cleanedData.installments_approvals = Array.from({ length: newCount }, (_, i) => {
            const existing = prevApprovals.find((p: any) => p.index === i + 1);
            return existing
              ? { ...existing, amount: newAmt }
              : { index: i + 1, amount: newAmt, approved: false, approved_at: null, approved_by: null };
          });
        } else {
          cleanedData.installments_approvals = [];
        }
      }

      const { data, error } = await supabase
        .from('extracts')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // إبطال جميع استعلامات المستخلصات لتحديث البيانات لجميع المستخدمين
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم تحديث المستخص بنجاح" });
    },
    onError: (error: any) => {
      console.error('Error updating extract:', error);
      toast({ title: "خطأ في تحديث المستخص", description: error.message, variant: "destructive" });
    },
  });

  // حذف مستخص
  const deleteExtract = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase.from('extracts').delete().eq('id', id);
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { error } = await query;
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم حذف المستخص بنجاح" });
    },
    onError: (error) => {
      console.error('Error deleting extract:', error);
      toast({ title: "خطأ في حذف المستخص", variant: "destructive" });
    },
  });

  // تعميد مستخلص
  const approveExtract = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('extracts')
        .update({ 
          approved: true, 
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // إرسال إشعار لجميع المستخدمين
      try {
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id');
        
        if (allProfiles) {
          const notifications = allProfiles
            .filter(p => p.user_id !== user?.id)
            .map(p => ({
              user_id: p.user_id,
              title: '✅ تم تعميد مستخلص',
              message: `تم تعميد المستخلص رقم ${data.extract_number} - المقاول: ${data.contractor_name} - المشروع: ${data.project_name}`,
              type: 'info'
            }));
          
          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        }
      } catch (notifError) {
        console.warn('Could not send approval notifications:', notifError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      toast({ title: "تم تعميد المستخلص بنجاح" });
    },
    onError: (error) => {
      console.error('Error approving extract:', error);
      toast({ title: "خطأ في تعميد المستخلص", variant: "destructive" });
    },
  });

  // إلغاء تعميد مستخلص
  const revokeApprovalExtract = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('extracts')
        .update({ 
          approved: false, 
          approved_by: null,
          approved_at: null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      toast({ title: "تم إلغاء تعميد المستخلص" });
    },
    onError: (error) => {
      console.error('Error revoking extract approval:', error);
      toast({ title: "خطأ في إلغاء التعميد", variant: "destructive" });
    },
  });

  // تعميد/إلغاء تعميد دفعة محددة
  const approveInstallment = useMutation({
    mutationFn: async ({ id, index, approve }: { id: string; index: number; approve: boolean }) => {
      const { data: current, error: fetchErr } = await supabase
        .from('extracts')
        .select('installments_approvals')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const list: any[] = Array.isArray((current as any)?.installments_approvals)
        ? [...(current as any).installments_approvals]
        : [];
      const updated = list.map((it: any) =>
        it.index === index
          ? {
              ...it,
              approved: approve,
              approved_at: approve ? new Date().toISOString() : null,
              approved_by: approve ? user?.id : null,
            }
          : it
      );

      const allApproved = updated.length > 0 && updated.every((it: any) => it.approved);

      const { data, error } = await supabase
        .from('extracts')
        .update({
          installments_approvals: updated,
          approved: allApproved,
          approved_by: allApproved ? user?.id : null,
          approved_at: allApproved ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      toast({ title: vars.approve ? `تم تعميد الدفعة ${vars.index}` : `تم إلغاء تعميد الدفعة ${vars.index}` });
    },
    onError: (error: any) => {
      console.error('Error updating installment approval:', error);
      toast({ title: 'خطأ في تعميد الدفعة', description: error.message, variant: 'destructive' });
    },
  });

  return {
    extracts,
    isLoading,
    createExtract,
    updateExtract,
    deleteExtract,
    approveExtract,
    revokeApprovalExtract,
    approveInstallment,
    approverName: approverName || 'مدير النظام',
  };
};