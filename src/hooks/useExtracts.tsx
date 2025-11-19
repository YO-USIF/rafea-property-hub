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

  // جلب المستخصات
  const { data: extracts = [], isLoading } = useQuery({
    queryKey: ['extracts', user?.id, isManagerOrAdmin],
    queryFn: async () => {
      console.log('Fetching extracts for user:', user?.id);
      console.log('isManager:', isManager, 'isAdmin:', isAdmin, 'isManagerOrAdmin:', isManagerOrAdmin);
      let query = supabase.from('extracts').select('*');
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
        console.log('Filtering by user_id:', user?.id);
      } else {
        console.log('Admin/Manager access - showing all extracts');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching extracts:', error);
        throw error;
      }
      console.log('Fetched extracts:', data);
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
  };
};