import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const usePurchases = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('purchases')
        .select('*, purchase_items(*)');
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، اجلب فقط مشترياته
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createPurchase = useMutation({
    mutationFn: async ({ items, ...purchaseData }: any) => {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{ ...purchaseData, user_id: user?.id }])
        .select()
        .single();
      
      if (purchaseError) throw purchaseError;

      if (items && items.length > 0) {
        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(items.map((item: any) => ({ ...item, purchase_id: purchase.id })));
        
        if (itemsError) throw itemsError;
      }

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({ title: "تم إضافة طلب الشراء بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة طلب الشراء", variant: "destructive" });
    },
  });

  const updatePurchase = useMutation({
    mutationFn: async ({ id, ...purchaseData }: any) => {
      let query = supabase
        .from('purchases')
        .update(purchaseData)
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
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({ title: "تم تحديث طلب الشراء بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث طلب الشراء", variant: "destructive" });
    },
  });

  const deletePurchase = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase
        .from('purchases')
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
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({ title: "تم حذف طلب الشراء بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف طلب الشراء", variant: "destructive" });
    },
  });

  return {
    purchases,
    isLoading,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
};