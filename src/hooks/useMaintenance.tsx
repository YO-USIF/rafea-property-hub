import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useMaintenance = () => {
  const { user } = useAuth();
  const { isManager } = useUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: maintenanceRequests = [], isLoading } = useQuery({
    queryKey: ['maintenance_requests', isManager],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select('*');
      
      // إذا لم يكن المستخدم مديراً، اجلب فقط طلبات الصيانة الخاصة به
      if (!isManager) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMaintenanceRequest = useMutation({
    mutationFn: async (requestData: any) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([{ ...requestData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast({ title: "تم إضافة طلب الصيانة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة طلب الصيانة", variant: "destructive" });
    },
  });

  const updateMaintenanceRequest = useMutation({
    mutationFn: async ({ id, ...requestData }: any) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(requestData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast({ title: "تم تحديث طلب الصيانة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث طلب الصيانة", variant: "destructive" });
    },
  });

  const deleteMaintenanceRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast({ title: "تم حذف طلب الصيانة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف طلب الصيانة", variant: "destructive" });
    },
  });

  return {
    maintenanceRequests,
    isLoading,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
  };
};