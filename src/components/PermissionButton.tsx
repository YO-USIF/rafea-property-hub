import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { Button, ButtonProps } from "@/components/ui/button";

interface PermissionButtonProps extends ButtonProps {
  children: ReactNode;
  pageName: string;
  requirePermission: 'create' | 'edit' | 'delete';
}

export const PermissionButton = ({ 
  children, 
  pageName, 
  requirePermission,
  ...buttonProps
}: PermissionButtonProps) => {
  const { checkPermission } = usePermissions();
  const { isAdmin } = useUserRole();

  // مدير النظام فقط لديه جميع الصلاحيات تلقائياً
  if (isAdmin) {
    return <Button {...buttonProps}>{children}</Button>;
  }

  // التحقق من الصلاحية
  const hasPermission = checkPermission(pageName, requirePermission);

  if (!hasPermission) {
    return null; // إخفاء الزر إذا لم تكن هناك صلاحية
  }

  return <Button {...buttonProps}>{children}</Button>;
};
