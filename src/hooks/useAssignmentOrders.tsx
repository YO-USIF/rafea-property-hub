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

  // جلب اسم مدير النظام (المعتمد)
  const { data: approverName } = useQuery({
    queryKey: ['approver-name'],
    queryFn: async () => {
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
      
      // جلب أسماء المستخدمين الذين أنشأوا أوامر التكليف
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        return data.map(order => ({
          ...order,
          created_by_name: profileMap.get(order.user_id) || 'غير معروف',
          approver_name: approverName || 'مدير النظام'
        }));
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
    approverName: approverName || 'مدير النظام',
  };
};
