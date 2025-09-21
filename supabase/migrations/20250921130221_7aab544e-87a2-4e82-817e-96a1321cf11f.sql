-- إنشاء دالة لتحديث إحصائيات المشروع تلقائياً
CREATE OR REPLACE FUNCTION public.update_project_stats(project_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- تحديث إحصائيات المشروع بناءً على المبيعات المرتبطة به
  UPDATE public.projects 
  SET 
    sold_units = (
      SELECT COUNT(*) 
      FROM public.sales 
      WHERE sales.project_id = update_project_stats.project_id 
      AND sales.status = 'مباع'
    ),
    total_cost = (
      SELECT COALESCE(SUM(price), 0)
      FROM public.sales 
      WHERE sales.project_id = update_project_stats.project_id 
      AND sales.status = 'مباع'
    )
  WHERE id = update_project_stats.project_id;
END;
$function$;

-- إنشاء ترايجر لتحديث إحصائيات المشروع تلقائياً عند تغيير المبيعات
CREATE OR REPLACE FUNCTION public.trigger_update_project_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- في حالة الإدراج أو التحديث
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.project_id IS NOT NULL THEN
      PERFORM public.update_project_stats(NEW.project_id);
    END IF;
    
    -- في حالة التحديث وتغيير المشروع
    IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
      IF OLD.project_id IS NOT NULL THEN
        PERFORM public.update_project_stats(OLD.project_id);
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- في حالة الحذف
  IF TG_OP = 'DELETE' THEN
    IF OLD.project_id IS NOT NULL THEN
      PERFORM public.update_project_stats(OLD.project_id);
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- إنشاء الترايجر على جدول المبيعات
DROP TRIGGER IF EXISTS update_project_stats_trigger ON public.sales;
CREATE TRIGGER update_project_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_project_stats();