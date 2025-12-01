import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export const useDashboardData = () => {
  const { user } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const isManagerOrAdmin = isManager || isAdmin;

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*');
      
      // جلب جميع البيانات للوحة التحكم
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['dashboard-maintenance', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select('*');
      
      // جلب جميع طلبات الصيانة للوحة التحكم
      
      const { data, error } = await query
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
      let query = supabase
        .from('contractors')
        .select('*');
      
      // جلب جميع المقاولين للوحة التحكم
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['dashboard-suppliers', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select('*');
      
      // جلب جميع الموردين للوحة التحكم
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks', isManagerOrAdmin],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*');
      
      // إذا لم يكن المستخدم مديراً أو مدير نظام، اجلب فقط مهامه
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading = projectsLoading || maintenanceLoading || contractorsLoading || suppliersLoading || tasksLoading;

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const totalMaintenanceRequests = maintenanceRequests?.length || 0;
  const activeContractors = contractors?.filter(c => c.status === 'نشط').length || 0;
  const activeSuppliers = suppliers?.filter(s => s.status === 'نشط').length || 0;

  // Calculate sold units and revenue
  const soldUnits = projects?.reduce((sum, project) => sum + (project.sold_units || 0), 0) || 0;
  const totalRevenue = projects?.reduce((sum, project) => {
    const soldUnits = project.sold_units || 0;
    const totalUnits = project.total_units || 1;
    const totalCost = project.total_cost || 0;
    return sum + (soldUnits * totalCost / totalUnits);
  }, 0) || 0;

  // Recent activities based on creation dates
  const recentActivities = [
    ...(projects?.slice(0, 2).map(project => ({
      id: project.id,
      title: `إضافة مشروع جديد: ${project.name}`,
      time: new Date(project.created_at).toLocaleDateString('en-GB'),
      type: 'project'
    })) || []),
    ...(maintenanceRequests?.slice(0, 2).map(request => ({
      id: request.id,
      title: `طلب صيانة جديد: ${request.issue_type} - ${request.building_name}`,
      time: new Date(request.created_at).toLocaleDateString('en-GB'),
      type: 'maintenance'
    })) || []),
    ...(tasks?.slice(0, 2).map(task => ({
      id: task.id,
      title: `إضافة مهمة جديدة: ${task.title}`,
      time: new Date(task.created_at).toLocaleDateString('en-GB'),
      type: 'task'
    })) || [])
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Get upcoming tasks from tasks table and high priority maintenance requests
  const upcomingTasksFromTasks = tasks?.filter(task => 
    task.status !== 'مكتملة' && task.status !== 'ملغية'
  ).slice(0, 3).map(task => ({
    id: task.id,
    title: task.title,
    due: task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB') : 'غير محدد',
    priority: task.priority === 'عالية' || task.priority === 'عاجلة' ? 'high' : 
              task.priority === 'متوسطة' ? 'medium' : 'low'
  })) || [];

  const upcomingTasksFromMaintenance = maintenanceRequests?.filter(req => 
    req.priority === 'عالية' || req.priority === 'عاجلة'
  ).slice(0, 2).map(req => ({
    id: `maintenance-${req.id}`,
    title: `صيانة ${req.issue_type} - ${req.building_name}`,
    due: new Date(req.reported_date).toLocaleDateString('en-GB'),
    priority: req.priority === 'عالية' || req.priority === 'عاجلة' ? 'high' : 'medium'
  })) || [];

  const upcomingTasks = [...upcomingTasksFromTasks, ...upcomingTasksFromMaintenance].slice(0, 4);

  return {
    isLoading,
    stats: {
      totalProjects,
      soldUnits,
      totalRevenue,
      activeContractors: activeContractors + activeSuppliers
    },
    recentActivities,
    upcomingTasks
  };
};