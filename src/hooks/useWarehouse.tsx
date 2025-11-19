import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useWarehouse = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: inventory = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['warehouse-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .order('item_name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['warehouse-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_transactions')
        .select('*, warehouse_inventory(item_name, item_code)')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createInventoryItem = useMutation({
    mutationFn: async (itemData: any) => {
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .insert([{ ...itemData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast({ title: "تم إضافة الصنف بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في إضافة الصنف", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, ...itemData }: any) => {
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast({ title: "تم تحديث الصنف بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في تحديث الصنف",
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteInventoryItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouse_inventory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast({ title: "تم حذف الصنف بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في حذف الصنف",
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (transactionData: any) => {
      const cleanedData = {
        ...transactionData,
        user_id: user?.id,
        project_id: transactionData.project_id || null,
        project_name: transactionData.project_name || null,
      };

      const { data, error } = await supabase
        .from('warehouse_transactions')
        .insert([cleanedData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast({ title: "تم تسجيل الحركة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في تسجيل الحركة",
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouse_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast({ title: "تم حذف الحركة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في حذف الحركة",
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return {
    inventory,
    transactions,
    isLoadingInventory,
    isLoadingTransactions,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    createTransaction,
    deleteTransaction,
  };
};
