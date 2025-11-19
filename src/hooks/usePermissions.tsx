import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserPermission {
  id: string;
  user_id: string;
  page_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionUpdate {
  user_id: string;
  page_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب جميع الصلاحيات (للمدير فقط)
  const { data: allPermissions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!user,
  });

  // جلب صلاحيات المستخدم الحالي
  const { data: myPermissions = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['my-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!user?.id,
  });

  // التحقق من صلاحية معينة
  const checkPermission = (pageName: string, permissionType: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    // التحقق من أن المستخدم مسجل دخول
    if (!user?.id) return false;
    
    const permission = myPermissions.find(p => p.page_name === pageName);
    
    // إذا وُجدت صلاحيات مخصصة، استخدمها
    if (permission) {
      switch (permissionType) {
        case 'view': return permission.can_view;
        case 'create': return permission.can_create;
        case 'edit': return permission.can_edit;
        case 'delete': return permission.can_delete;
        default: return false;
      }
    }
    
    // إذا لم توجد صلاحيات مخصصة، لا يتم منح أي صلاحية (افتراضيًا: كل شيء مغلق)
    return false;
  };

  // التحقق من إمكانية الوصول للصفحة
  const canAccessPage = (pageName: string): boolean => {
    return checkPermission(pageName, 'view');
  };

  // تحديث أو إنشاء صلاحيات
  const upsertPermission = useMutation({
    mutationFn: async (data: PermissionUpdate) => {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: data.user_id,
          page_name: data.page_name,
          can_view: data.can_view,
          can_create: data.can_create,
          can_edit: data.can_edit,
          can_delete: data.can_delete,
        }, {
          onConflict: 'user_id,page_name'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الصلاحيات بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تحديث الصلاحيات',
        variant: 'destructive',
      });
    },
  });

  // حذف صلاحيات
  const deletePermission = useMutation({
    mutationFn: async ({ userId, pageName }: { userId: string; pageName: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('page_name', pageName);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الصلاحيات بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل حذف الصلاحيات',
        variant: 'destructive',
      });
    },
  });

  return {
    allPermissions,
    myPermissions,
    isLoadingAll,
    isLoadingMy,
    checkPermission,
    canAccessPage,
    upsertPermission,
    deletePermission,
  };
};
