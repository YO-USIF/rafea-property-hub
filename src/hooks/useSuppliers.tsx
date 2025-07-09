import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useSuppliers = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select('*');
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، اجلب فقط مورديه
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createSupplier = useMutation({
    mutationFn: async (supplierData: any) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "تم إضافة المورد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة المورد", variant: "destructive" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...supplierData }: any) => {
      let query = supabase
        .from('suppliers')
        .update(supplierData)
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "تم تحديث المورد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث المورد", variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase
        .from('suppliers')
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "تم حذف المورد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف المورد", variant: "destructive" });
    },
  });

  return {
    suppliers,
    isLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};