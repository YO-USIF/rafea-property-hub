-- Fix the check_user_permission function to enforce whitelist security model
-- Only admins get automatic access; all other users must have explicit permissions granted

CREATE OR REPLACE FUNCTION public.check_user_permission(_user_id uuid, _page_name text, _permission_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_permission BOOLEAN;
BEGIN
  -- التحقق من أن مدير النظام لديه جميع الصلاحيات
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- التحقق من الصلاحية المخصصة
  SELECT 
    CASE 
      WHEN _permission_type = 'view' THEN can_view
      WHEN _permission_type = 'create' THEN can_create
      WHEN _permission_type = 'edit' THEN can_edit
      WHEN _permission_type = 'delete' THEN can_delete
      ELSE false
    END INTO has_permission
  FROM public.user_permissions
  WHERE user_id = _user_id AND page_name = _page_name;
  
  -- إذا لم توجد صلاحيات مخصصة، لا يتم منح أي صلاحية (نموذج القائمة البيضاء)
  -- Only System Admin has automatic access, all other users need explicit permissions
  IF has_permission IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN COALESCE(has_permission, false);
END;
$function$;