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
      const { data, error } = await supabase
        .from('extracts')
        .insert([{ ...extractData, user_id: user?.id }])
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
    mutationFn: async ({ id, ...updateData }: any) => {
      let query = supabase.from('extracts').update(updateData).eq('id', id);
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // إبطال جميع استعلامات المستخلصات لتحديث البيانات لجميع المستخدمين
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم تحديث المستخص بنجاح" });
    },
    onError: (error) => {
      console.error('Error updating extract:', error);
      toast({ title: "خطأ في تحديث المستخص", variant: "destructive" });
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
      // إبطال جميع استعلامات المستخلصات لتحديث البيانات لجميع المستخدمين
      queryClient.invalidateQueries({ queryKey: ['extracts'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم حذف المستخص بنجاح" });
    },
    onError: (error) => {
      console.error('Error deleting extract:', error);
      toast({ title: "خطأ في حذف المستخص", variant: "destructive" });
    },
  });

  return {
    extracts,
    isLoading,
    createExtract,
    updateExtract,
    deleteExtract,
    approverName: approverName || 'مدير النظام',
  };
};