import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// نستخدم any مؤقتاً لحين تحديث أنواع Supabase للجدول الجديد
const db = supabase as any;

export const useContracts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contractor_contracts'],
    queryFn: async () => {
      const { data, error } = await db
        .from('contractor_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createContract = useMutation({
    mutationFn: async (contractData: any) => {
      const { data, error } = await db
        .from('contractor_contracts')
        .insert([{ ...contractData, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor_contracts'] });
      toast({ title: 'تم حفظ العقد بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في حفظ العقد', description: error.message, variant: 'destructive' });
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...contractData }: any) => {
      const { data, error } = await db
        .from('contractor_contracts')
        .update(contractData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor_contracts'] });
      toast({ title: 'تم تحديث العقد بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في تحديث العقد', description: error.message, variant: 'destructive' });
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('contractor_contracts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor_contracts'] });
      toast({ title: 'تم حذف العقد' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في حذف العقد', description: error.message, variant: 'destructive' });
    },
  });

  // تعميد مدير النظام
  const approveContract = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await db
        .from('contractor_contracts')
        .update({
          approved: true,
          status: 'معتمد',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      // إشعار جميع المستخدمين بالتعميد
      try {
        const { data: allProfiles } = await supabase.from('profiles').select('user_id');
        if (allProfiles) {
          const notifications = allProfiles
            .filter((p) => p.user_id !== user?.id)
            .map((p) => ({
              user_id: p.user_id,
              title: '✅ تم تعميد عقد مقاول',
              message: `تم تعميد العقد رقم ${data.contract_number} - المقاول: ${data.contractor_name || ''}`,
              type: 'info',
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
      queryClient.invalidateQueries({ queryKey: ['contractor_contracts'] });
      toast({ title: 'تم تعميد العقد بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في تعميد العقد', description: error.message, variant: 'destructive' });
    },
  });

  const revokeApproval = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await db
        .from('contractor_contracts')
        .update({ approved: false, status: 'مسودة', approved_by: null, approved_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor_contracts'] });
      toast({ title: 'تم إلغاء تعميد العقد' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في إلغاء التعميد', description: error.message, variant: 'destructive' });
    },
  });

  return {
    contracts,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
    approveContract,
    revokeApproval,
  };
};
