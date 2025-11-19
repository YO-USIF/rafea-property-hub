-- إنشاء جدول صلاحيات المستخدمين المخصصة
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_name TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_name)
);

-- تفعيل RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح لمدير النظام بإدارة الصلاحيات
CREATE POLICY "Admin can manage all permissions"
ON public.user_permissions
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- سياسة للسماح للمستخدمين بعرض صلاحياتهم الخاصة
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- دالة للتحقق من صلاحيات المستخدم على صفحة معينة
CREATE OR REPLACE FUNCTION public.check_user_permission(
  _user_id UUID,
  _page_name TEXT,
  _permission_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- إذا لم توجد صلاحيات مخصصة، استخدم الصلاحيات الافتراضية بناءً على الدور
  IF has_permission IS NULL THEN
    -- المدراء لديهم صلاحيات عرض وتعديل وحذف بشكل افتراضي
    IF is_manager_or_admin() THEN
      RETURN true;
    END IF;
    
    -- الموظفون لديهم صلاحية العرض فقط بشكل افتراضي
    RETURN _permission_type = 'view';
  END IF;
  
  RETURN COALESCE(has_permission, false);
END;
$$;

COMMENT ON TABLE public.user_permissions IS 'جدول لتخزين صلاحيات المستخدمين المخصصة لكل صفحة';
COMMENT ON FUNCTION public.check_user_permission IS 'دالة للتحقق من صلاحيات المستخدم على صفحة معينة';