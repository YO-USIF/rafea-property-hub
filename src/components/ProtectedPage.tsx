import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { Lock } from "lucide-react";

interface ProtectedPageProps {
  children: ReactNode;
  pageName: string;
  requirePermission?: 'view' | 'create' | 'edit' | 'delete';
}

export const ProtectedPage = ({ 
  children, 
  pageName, 
  requirePermission = 'view' 
}: ProtectedPageProps) => {
  const { checkPermission, isLoadingMy } = usePermissions();
  const { isAdmin, isManager, loading: roleLoading } = useUserRole();

  if (roleLoading || isLoadingMy) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  // مدير النظام لديه جميع الصلاحيات
  if (isAdmin) {
    return <>{children}</>;
  }

  // المدراء لديهم جميع الصلاحيات
  if (isManager) {
    return <>{children}</>;
  }

  // الموظفون العاديون: التحقق من الصلاحية المطلوبة
  const hasPermission = checkPermission(pageName, requirePermission);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-muted-foreground">
            ليس لديك صلاحية {requirePermission === 'view' ? 'عرض' : requirePermission === 'create' ? 'إضافة' : requirePermission === 'edit' ? 'تعديل' : 'حذف'} هذه الصفحة
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
