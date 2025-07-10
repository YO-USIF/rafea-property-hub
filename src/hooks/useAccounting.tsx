import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useAccounting = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جلب دليل الحسابات
  const { data: chartOfAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب القيود اليومية
  const { data: journalEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      let query = supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_lines:journal_entry_lines(
            *,
            account:chart_of_accounts(account_code, account_name)
          )
        `);
      
      if (!isManagerOrAdmin) {
        query = query.eq('created_by', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // إنشاء قيد يومية
  const createJournalEntry = useMutation({
    mutationFn: async (entryData: any) => {
      const { lines, ...journalData } = entryData;
      
      // التأكد من وجود entry_number
      if (!journalData.entry_number) {
        journalData.entry_number = 'JE-' + Date.now();
      }
      
      // إنشاء القيد الرئيسي
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([{ ...journalData, created_by: user?.id }])
        .select()
        .single();
      
      if (entryError) throw entryError;

      // إضافة الأسطر
      if (lines && lines.length > 0) {
        const linesWithEntryId = lines.map((line: any) => ({ 
          ...line, 
          journal_entry_id: entry.id,
          // التأكد من أن المبالغ أرقام
          debit_amount: Number(line.debit_amount) || 0,
          credit_amount: Number(line.credit_amount) || 0
        }));
        
        const { error: linesError } = await supabase
          .from('journal_entry_lines')
          .insert(linesWithEntryId);
        
        if (linesError) throw linesError;
      }

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: "تم إنشاء القيد بنجاح" });
    },
    onError: (error) => {
      console.error('Error creating journal entry:', error);
      toast({ title: "خطأ في إنشاء القيد", variant: "destructive" });
    },
  });

  // جلب التقارير المالية
  const generateIncomeStatement = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      // جلب الإيرادات
      const { data: revenues, error: revenueError } = await supabase
        .from('journal_entry_lines')
        .select(`
          credit_amount,
          journal_entry:journal_entries!inner(transaction_date),
          account:chart_of_accounts!inner(account_type, account_name)
        `)
        .eq('account.account_type', 'إيرادات')
        .gte('journal_entry.transaction_date', startDate)
        .lte('journal_entry.transaction_date', endDate)
        .eq('journal_entry.status', 'posted');

      if (revenueError) throw revenueError;

      // جلب المصروفات
      const { data: expenses, error: expenseError } = await supabase
        .from('journal_entry_lines')
        .select(`
          debit_amount,
          journal_entry:journal_entries!inner(transaction_date),
          account:chart_of_accounts!inner(account_type, account_name)
        `)
        .eq('account.account_type', 'مصروفات')
        .gte('journal_entry.transaction_date', startDate)
        .lte('journal_entry.transaction_date', endDate)
        .eq('journal_entry.status', 'posted');

      if (expenseError) throw expenseError;

      const totalRevenue = revenues.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        revenueDetails: revenues,
        expenseDetails: expenses
      };
    },
    onError: (error) => {
      toast({ title: "خطأ في إنشاء التقرير", variant: "destructive" });
    },
  });

  return {
    chartOfAccounts,
    journalEntries,
    isLoadingAccounts,
    isLoadingEntries,
    createJournalEntry,
    generateIncomeStatement,
  };
};