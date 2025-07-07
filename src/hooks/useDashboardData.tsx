import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDashboardData = () => {
  const { user } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading = projectsLoading || maintenanceLoading || contractorsLoading || suppliersLoading;

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
    ...(projects?.slice(0, 3).map(project => ({
      id: project.id,
      title: `إضافة مشروع جديد: ${project.name}`,
      time: new Date(project.created_at).toLocaleDateString('ar-SA'),
      type: 'project'
    })) || []),
    ...(maintenanceRequests?.slice(0, 3).map(request => ({
      id: request.id,
      title: `طلب صيانة جديد: ${request.issue_type} - ${request.building_name}`,
      time: new Date(request.created_at).toLocaleDateString('ar-SA'),
      type: 'maintenance'
    })) || [])
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

  // High priority maintenance requests as tasks
  const upcomingTasks = maintenanceRequests?.filter(req => 
    req.priority === 'عالية' || req.priority === 'عاجلة'
  ).slice(0, 4).map(req => ({
    id: req.id,
    title: `صيانة ${req.issue_type} - ${req.building_name}`,
    due: new Date(req.reported_date).toLocaleDateString('ar-SA'),
    priority: req.priority === 'عالية' || req.priority === 'عاجلة' ? 'high' : 'medium'
  })) || [];

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