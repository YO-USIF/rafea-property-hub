import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching role for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(); // تغيير من single إلى maybeSingle

        if (error) {
          console.error('Error fetching user role:', error);
          setLoading(false);
          return;
        }

        console.log('User role data:', data);
        const role = data?.role || null;
        setUserRole(role);
        const isManagerRole = role === 'مدير' || role === 'مدير النظام';
        const isAdminRole = role === 'مدير النظام';
        setIsManager(isManagerRole);
        setIsAdmin(isAdminRole);
        console.log('Role processed:', { role, isManagerRole, isAdminRole });
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
    loading,
  };
};