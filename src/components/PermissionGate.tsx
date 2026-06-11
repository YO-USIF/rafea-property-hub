import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";

interface PermissionGateProps {
  children: ReactNode;
  pageName: string;
  requirePermission: 'view' | 'create' | 'edit' | 'delete';
}

/**
 * يعرض المحتوى فقط إذا كان المستخدم يملك الصلاحية المطلوبة.
 * مفيد لإخفاء عناصر معقدة مثل نوافذ التأكيد (AlertDialog).
 */
export const PermissionGate = ({
  children,
  pageName,
  requirePermission,
}: PermissionGateProps) => {
  const { checkPermission, isLoadingMy, authLoading } = usePermissions();
  const { isAdmin, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading || isLoadingMy) {
    return null;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!checkPermission(pageName, requirePermission)) {
    return null;
  }

  return <>{children}</>;
};
