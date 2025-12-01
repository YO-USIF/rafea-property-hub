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

      // جلب بيانات المبيعات
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('project_id, price, status');

      if (salesError) throw salesError;

      // جلب بيانات المستخلصات
      const { data: extractsData, error: extractsError } = await supabase
        .from('extracts')
        .select('project_id, amount');

      if (extractsError) throw extractsError;

      // جلب بيانات الفواتير
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('project_id, amount');

      if (invoicesError) throw invoicesError;

      // جلب بيانات أوامر التكليف
      const { data: assignmentOrdersData, error: assignmentOrdersError } = await supabase
        .from('assignment_orders')
        .select('project_id, amount');

      if (assignmentOrdersError) throw assignmentOrdersError;

      // حساب إجمالي مبيعات كل مشروع
      const salesByProject = salesData?.reduce((acc: any, sale: any) => {
        if (sale.status === 'مباع' && sale.project_id) {
          if (!acc[sale.project_id]) {
            acc[sale.project_id] = 0;
          }
          acc[sale.project_id] += Number(sale.price) || 0;
        }
        return acc;
      }, {});

      // حساب إجمالي المصروفات لكل مشروع
      const expensesByProject: any = {};

      // إضافة المستخلصات
      extractsData?.forEach((extract: any) => {
        if (extract.project_id) {
          if (!expensesByProject[extract.project_id]) {
            expensesByProject[extract.project_id] = 0;
          }
          expensesByProject[extract.project_id] += Number(extract.amount) || 0;
        }
      });

      // إضافة الفواتير
      invoicesData?.forEach((invoice: any) => {
        if (invoice.project_id) {
          if (!expensesByProject[invoice.project_id]) {
            expensesByProject[invoice.project_id] = 0;
          }
          expensesByProject[invoice.project_id] += Number(invoice.amount) || 0;
        }
      });

      // إضافة أوامر التكليف
      assignmentOrdersData?.forEach((order: any) => {
        if (order.project_id) {
          if (!expensesByProject[order.project_id]) {
            expensesByProject[order.project_id] = 0;
          }
          expensesByProject[order.project_id] += Number(order.amount) || 0;
        }
      });

      // تحديث بيانات كل مشروع
      const updatedProjects = projectsData?.map((project: any) => ({
        ...project,
        total_sales: salesByProject?.[project.id] || 0,
        total_expenses: expensesByProject?.[project.id] || 0
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