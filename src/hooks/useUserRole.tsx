import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const ROLE_PRIORITY = ['مدير النظام', 'مدير', 'مدير مشروع'] as const;

const getPrimaryRole = (roles: string[]) => {
  return ROLE_PRIORITY.find((role) => roles.includes(role)) ?? roles[0] ?? null;
};

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resetRoleState = () => {
      if (!isMounted) return;
      setUserRole(null);
      setIsManager(false);
      setIsAdmin(false);
      setIsProjectManager(false);
    };

    const fetchUserRole = async () => {
      if (authLoading) {
        if (isMounted) setLoading(true);
        return;
      }

      if (!user?.id) {
        resetRoleState();
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) setLoading(true);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        const roles = (data ?? []).map((item) => item.role).filter(Boolean) as string[];
        const primaryRole = getPrimaryRole(roles);

        if (!isMounted) return;

        setUserRole(primaryRole);
        setIsAdmin(roles.includes('مدير النظام'));
        setIsManager(roles.includes('مدير النظام') || roles.includes('مدير'));
        setIsProjectManager(roles.includes('مدير مشروع'));
      } catch (error) {
        console.error('Error fetching user role:', error);
        resetRoleState();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.id]);

  return {
    userRole,
    isManager,
    isAdmin,
    isProjectManager,
    loading,
  };
};