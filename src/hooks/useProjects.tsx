import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from './use-toast';

export const useProjects = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', isManagerOrAdmin],
    queryFn: async () => {
      // جلب المشاريع
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;

      // جلب بيانات المبيعات لحساب التكلفة من المبيعات
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('project_id, price, status');

      if (salesError) throw salesError;

      // حساب إجمالي مبيعات كل مشروع باستخدام project_id
      const salesByProject = salesData?.reduce((acc: any, sale: any) => {
        if (sale.status === 'مباع' && sale.project_id) {
          if (!acc[sale.project_id]) {
            acc[sale.project_id] = 0;
          }
          acc[sale.project_id] += Number(sale.price) || 0;
        }
        return acc;
      }, {});

      // تحديث تكلفة كل مشروع بناءً على المبيعات
      const updatedProjects = projectsData?.map((project: any) => ({
        ...project,
        total_cost: salesByProject?.[project.id] || 0
      }));

      return updatedProjects;
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (projectData: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم إضافة المشروع بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة المشروع", variant: "destructive" });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...projectData }: any) => {
      let query = supabase
        .from('projects')
        .update(projectData)
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
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم تحديث المشروع بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث المشروع", variant: "destructive" });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      let query = supabase
        .from('projects')
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
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "تم حذف المشروع بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف المشروع", variant: "destructive" });
    },
  });

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
};