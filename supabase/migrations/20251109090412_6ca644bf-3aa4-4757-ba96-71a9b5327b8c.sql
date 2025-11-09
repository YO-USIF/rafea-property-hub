-- دالة للتحقق من الكميات وإنشاء الإشعارات
CREATE OR REPLACE FUNCTION public.check_low_stock_and_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id UUID;
  manager_user_id UUID;
BEGIN
  -- التحقق من أن الكمية الحالية وصلت أو أقل من الحد الأدنى
  IF NEW.current_quantity <= NEW.minimum_quantity AND 
     (OLD.current_quantity IS NULL OR OLD.current_quantity > NEW.minimum_quantity) THEN
    
    -- إنشاء إشعار لمدير النظام
    FOR admin_user_id IN 
      SELECT DISTINCT user_id 
      FROM public.user_roles 
      WHERE role = 'مدير النظام'
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
      ) VALUES (
        admin_user_id,
        'تنبيه: نقص في المخزون',
        'الصنف "' || NEW.item_name || '" (كود: ' || NEW.item_code || ') وصل إلى الحد الأدنى. الكمية الحالية: ' || NEW.current_quantity || ' ' || NEW.unit || '. الحد الأدنى: ' || NEW.minimum_quantity || ' ' || NEW.unit,
        'warning'
      );
    END LOOP;
    
    -- إنشاء إشعار للمدراء
    FOR manager_user_id IN 
      SELECT DISTINCT user_id 
      FROM public.user_roles 
      WHERE role = 'مدير'
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
      ) VALUES (
        manager_user_id,
        'تنبيه: نقص في المخزون',
        'الصنف "' || NEW.item_name || '" (كود: ' || NEW.item_code || ') وصل إلى الحد الأدنى. الكمية الحالية: ' || NEW.current_quantity || ' ' || NEW.unit || '. الحد الأدنى: ' || NEW.minimum_quantity || ' ' || NEW.unit,
        'warning'
      );
    END LOOP;
    
    -- إنشاء إشعار للمستخدم الذي أنشأ الصنف
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
      ) VALUES (
        NEW.user_id,
        'تنبيه: نقص في المخزون',
        'الصنف "' || NEW.item_name || '" (كود: ' || NEW.item_code || ') الذي أضفته وصل إلى الحد الأدنى. الكمية الحالية: ' || NEW.current_quantity || ' ' || NEW.unit || '. الحد الأدنى: ' || NEW.minimum_quantity || ' ' || NEW.unit,
        'warning'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- إنشاء trigger للتحقق من المخزون
DROP TRIGGER IF EXISTS check_inventory_low_stock ON public.warehouse_inventory;
CREATE TRIGGER check_inventory_low_stock
AFTER INSERT OR UPDATE OF current_quantity ON public.warehouse_inventory
FOR EACH ROW
EXECUTE FUNCTION public.check_low_stock_and_notify();

-- دالة لإنشاء تقرير يومي بالأصناف المنخفضة
CREATE OR REPLACE FUNCTION public.get_low_stock_items()
RETURNS TABLE (
  id UUID,
  item_name TEXT,
  item_code TEXT,
  category TEXT,
  current_quantity NUMERIC,
  minimum_quantity NUMERIC,
  unit TEXT,
  location TEXT,
  shortage_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    wi.id,
    wi.item_name,
    wi.item_code,
    wi.category,
    wi.current_quantity,
    wi.minimum_quantity,
    wi.unit,
    wi.location,
    CASE 
      WHEN wi.minimum_quantity > 0 THEN 
        ROUND(((wi.minimum_quantity - wi.current_quantity) / wi.minimum_quantity * 100)::numeric, 2)
      ELSE 0
    END as shortage_percentage
  FROM public.warehouse_inventory wi
  WHERE wi.current_quantity <= wi.minimum_quantity
  ORDER BY 
    CASE 
      WHEN wi.minimum_quantity > 0 THEN 
        (wi.current_quantity / wi.minimum_quantity)
      ELSE 1
    END ASC,
    wi.item_name ASC;
END;
$function$;