import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';
import { useNotifications } from './useNotifications';

export const useTasks = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*');
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، اجلب فقط مهامه
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "تم إضافة المهمة بنجاح" });
      
      // إنشاء إشعار عند إضافة مهمة جديدة
      createNotification.taskAssigned(newTask.title, newTask.assigned_to);
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة المهمة", variant: "destructive" });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...taskData }: any) => {
      let query = supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id);
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، قيد التحديث للمستخدم فقط
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "تم تحديث المهمة بنجاح" });
      
      // إنشاء إشعار عند اكتمال المهمة
      if (updatedTask.status === 'مكتملة') {
        createNotification.taskCompleted(updatedTask.title, updatedTask.assigned_to);
      }
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث المهمة", variant: "destructive" });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase
        .from('tasks')
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "تم حذف المهمة بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف المهمة", variant: "destructive" });
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};