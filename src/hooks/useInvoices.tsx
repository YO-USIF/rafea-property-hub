import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useInvoices = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id, isManagerOrAdmin],
    queryFn: async () => {
      try {
        console.log('=== INVOICE FETCH DEBUG ===');
        console.log('User:', user?.id);
        console.log('Is Manager/Admin:', isManagerOrAdmin);
        
        let query = supabase.from('invoices').select('*');
        
        // المديرون ومديرو النظام يمكنهم رؤية جميع الفواتير
        if (!isManagerOrAdmin) {
          query = query.eq('user_id', user?.id);
          console.log('Adding user filter for:', user?.id);
        } else {
          console.log('Manager/Admin view - showing all invoices');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        console.log('Query result:', { data: data?.length, error });
        
        if (error) {
          console.error('Error fetching invoices:', error);
          throw error;
        }
        
        console.log('Returning invoices:', data);
        return data || [];
      } catch (err) {
        console.error('Full error in invoice fetch:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoiceData: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoiceData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;

      // إنشاء قيد محاسبي للفاتورة
      if (invoiceData.amount > 0) {
        try {
          await supabase.rpc('create_invoice_journal_entry', {
            invoice_id: data.id,
            invoice_amount: invoiceData.amount,
            supplier_name: invoiceData.supplier_name
          });
        } catch (journalError) {
          console.warn('Warning: Could not create journal entry for invoice:', journalError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "تم إضافة الفاتورة بنجاح" });
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast({ title: "خطأ في إضافة الفاتورة", variant: "destructive" });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...invoiceData }: any) => {
      let query = supabase
        .from('invoices')
        .update(invoiceData)
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "تم تحديث الفاتورة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث الفاتورة", variant: "destructive" });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase
        .from('invoices')
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: "تم حذف الفاتورة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف الفاتورة", variant: "destructive" });
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};