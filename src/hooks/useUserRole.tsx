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
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setLoading(false);
          return;
        }

        const role = data?.role || null;
        console.log('User role fetched:', role, 'for user:', user.id);
        setUserRole(role);
        setIsManager(role === 'مدير' || role === 'مدير النظام');
        setIsAdmin(role === 'مدير النظام');
        console.log('Manager status:', role === 'مدير' || role === 'مدير النظام', 'Admin status:', role === 'مدير النظام');
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