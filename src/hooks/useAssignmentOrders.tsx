import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useAssignmentOrders = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: assignmentOrders = [], isLoading } = useQuery({
    queryKey: ['assignment_orders', user?.id, isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase.from('assignment_orders').select('*');
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching assignment orders:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createAssignmentOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from('assignment_orders')
        .insert([{ ...orderData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment_orders'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم إنشاء أمر التكليف بنجاح" });
    },
    onError: (error) => {
      console.error('Error creating assignment order:', error);
      toast({ title: "خطأ في إنشاء أمر التكليف", variant: "destructive" });
    },
  });

  const updateAssignmentOrder = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      let query = supabase.from('assignment_orders').update(updateData).eq('id', id);
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment_orders'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم تحديث أمر التكليف بنجاح" });
    },
    onError: (error) => {
      console.error('Error updating assignment order:', error);
      toast({ title: "خطأ في تحديث أمر التكليف", variant: "destructive" });
    },
  });

  const deleteAssignmentOrder = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase.from('assignment_orders').delete().eq('id', id);
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { error } = await query;
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment_orders'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم حذف أمر التكليف بنجاح" });
    },
    onError: (error) => {
      console.error('Error deleting assignment order:', error);
      toast({ title: "خطأ في حذف أمر التكليف", variant: "destructive" });
    },
  });

  return {
    assignmentOrders,
    isLoading,
    createAssignmentOrder,
    updateAssignmentOrder,
    deleteAssignmentOrder,
  };
};
