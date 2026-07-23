import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export const useDashboardData = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;
  const queryClient = useQueryClient();

  // الاشتراك في تحديثات قاعدة البيانات في الوقت الفعلي لجميع الجداول المؤثرة على لوحة التحكم
  useEffect(() => {
    if (!user?.id) return;

    const tablesToWatch = [
      { table: 'projects', queryKey: 'dashboard-projects' },
      { table: 'maintenance_requests', queryKey: 'dashboard-maintenance' },
      { table: 'contractors', queryKey: 'dashboard-contractors' },
      { table: 'suppliers', queryKey: 'dashboard-suppliers' },
      { table: 'tasks', queryKey: 'dashboard-tasks' },
      { table: 'sales', queryKey: 'dashboard-sales' },
      { table: 'extracts', queryKey: 'dashboard-extracts' },
      { table: 'invoices', queryKey: 'dashboard-invoices' },
    ];

    const channels = tablesToWatch.map(({ table, queryKey }) => {
      return supabase
        .channel(`dashboard-${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            queryClient.invalidateQueries({ queryKey: [queryKey, isManagerOrAdmin] });
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [user?.id, isManagerOrAdmin, queryClient]);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects', isManagerOrAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['dashboard-maintenance', isManagerOrAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['dashboard-contractors', isManagerOrAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.from('contractors').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['dashboard-suppliers', isManagerOrAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*');
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب بيانات المبيعات الفعلية لحساب الإيرادات الحقيقية
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['dashboard-sales', isManagerOrAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, price, status, project_id, created_at, customer_name, unit_number')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading =
    projectsLoading ||
    maintenanceLoading ||
    contractorsLoading ||
    suppliersLoading ||
    tasksLoading ||
    salesLoading;

  // إحصائيات المشاريع
  const totalProjects = projects?.length || 0;
  const activeContractors = contractors?.filter((c) => c.status === 'نشط').length || 0;
  const activeSuppliers = suppliers?.filter((s) => s.status === 'نشط').length || 0;

  // حساب الوحدات المباعة والإيرادات من جدول المبيعات الفعلي
  const soldSales = sales?.filter((s) => s.status === 'مباع') || [];
  const soldUnits = soldSales.length;
  const totalRevenue = soldSales.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  // الأنشطة الأخيرة من مصادر متعددة
  const recentActivities = [
    ...(projects?.slice(0, 2).map((project) => ({
      id: `project-${project.id}`,
      title: `إضافة مشروع جديد: ${project.name}`,
      time: new Date(project.created_at).toLocaleDateString('en-GB'),
      timestamp: new Date(project.created_at).getTime(),
      type: 'project',
    })) || []),
    ...(soldSales.slice(0, 2).map((sale) => ({
      id: `sale-${sale.id}`,
      title: `عملية بيع جديدة: ${sale.customer_name} - وحدة ${sale.unit_number}`,
      time: new Date(sale.created_at).toLocaleDateString('en-GB'),
      timestamp: new Date(sale.created_at).getTime(),
      type: 'sale',
    })) || []),
    ...(maintenanceRequests?.slice(0, 2).map((request) => ({
      id: `maintenance-${request.id}`,
      title: `طلب صيانة جديد: ${request.issue_type} - ${request.building_name}`,
      time: new Date(request.created_at).toLocaleDateString('en-GB'),
      timestamp: new Date(request.created_at).getTime(),
      type: 'maintenance',
    })) || []),
    ...(tasks?.slice(0, 2).map((task) => ({
      id: `task-${task.id}`,
      title: `إضافة مهمة جديدة: ${task.title}`,
      time: new Date(task.created_at).toLocaleDateString('en-GB'),
      timestamp: new Date(task.created_at).getTime(),
      type: 'task',
    })) || []),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // المهام القادمة
  const upcomingTasksFromTasks =
    tasks
      ?.filter((task) => task.status !== 'مكتملة' && task.status !== 'ملغية')
      .slice(0, 3)
      .map((task) => ({
        id: task.id,
        title: task.title,
        due: task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB') : 'غير محدد',
        priority:
          task.priority === 'عالية' || task.priority === 'عاجلة'
            ? 'high'
            : task.priority === 'متوسطة'
            ? 'medium'
            : 'low',
      })) || [];

  const upcomingTasksFromMaintenance =
    maintenanceRequests
      ?.filter((req) => req.priority === 'عالية' || req.priority === 'عاجلة')
      .slice(0, 2)
      .map((req) => ({
        id: `maintenance-${req.id}`,
        title: `صيانة ${req.issue_type} - ${req.building_name}`,
        due: new Date(req.reported_date).toLocaleDateString('en-GB'),
        priority: 'high',
      })) || [];

  const upcomingTasks = [...upcomingTasksFromTasks, ...upcomingTasksFromMaintenance].slice(0, 4);

  return {
    isLoading,
    stats: {
      totalProjects,
      soldUnits,
      totalRevenue,
      activeContractors: activeContractors + activeSuppliers,
    },
    recentActivities,
    upcomingTasks,
  };
};
