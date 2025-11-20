import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setLoading(false);
          return;
        }

        const role = data?.role || null;
        setUserRole(role);
        const isManagerRole = role === 'مدير' || role === 'مدير النظام';
        const isAdminRole = role === 'مدير النظام';
        const isProjectManagerRole = (role as string) === 'مدير مشروع';
        setIsManager(isManagerRole);
        setIsAdmin(isAdminRole);
        setIsProjectManager(isProjectManagerRole);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return {
    userRole,
    isManager,
    isAdmin,
    isProjectManager,
    loading,
  };
};