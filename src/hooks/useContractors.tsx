import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useContractors = () => {
  const { user } = useAuth();
  const { isManager } = useUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ['contractors', isManager],
    queryFn: async () => {
      let query = supabase
        .from('contractors')
        .select('*');
      
      // إذا لم يكن المستخدم مديراً، اجلب فقط مقاوليه
      if (!isManager) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createContractor = useMutation({
    mutationFn: async (contractorData: any) => {
      const { data, error } = await supabase
        .from('contractors')
        .insert([{ ...contractorData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast({ title: "تم إضافة المقاول بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة المقاول", variant: "destructive" });
    },
  });

  const updateContractor = useMutation({
    mutationFn: async ({ id, ...contractorData }: any) => {
      const { data, error } = await supabase
        .from('contractors')
        .update(contractorData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast({ title: "تم تحديث المقاول بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث المقاول", variant: "destructive" });
    },
  });

  const deleteContractor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contractors')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast({ title: "تم حذف المقاول بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف المقاول", variant: "destructive" });
    },
  });

  return {
    contractors,
    isLoading,
    createContractor,
    updateContractor,
    deleteContractor,
  };
};