import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useTaskReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['task-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createReport = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('task_reports')
        .insert([
          {
            title,
            content,
            created_by: user?.id,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-reports'] });
      toast({ title: "تم إنشاء التقرير بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إنشاء التقرير", variant: "destructive" });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('task_reports')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-reports'] });
      toast({ title: "تم تحديث التقرير بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث التقرير", variant: "destructive" });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-reports'] });
      toast({ title: "تم حذف التقرير بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف التقرير", variant: "destructive" });
    },
  });

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
  };
};