-- إنشاء دالة لتوليد رقم المستخلص تلقائياً
CREATE OR REPLACE FUNCTION public.generate_extract_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  -- إذا كان رقم المستخلص موجوداً بالفعل، لا تعدله
  IF NEW.extract_number IS NOT NULL AND NEW.extract_number != '' THEN
    RETURN NEW;
  END IF;
  
  -- الحصول على السنة الحالية
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- الحصول على آخر رقم مستخلص في هذه السنة
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(extract_number FROM '\d+$') AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_number
  FROM public.extracts
  WHERE extract_number ~ ('^EXT-' || year_part || '-\d+$');
  
  -- إنشاء رقم المستخلص الجديد
  NEW.extract_number := 'EXT-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتوليد رقم المستخلص قبل الإدراج
DROP TRIGGER IF EXISTS trigger_generate_extract_number ON public.extracts;
CREATE TRIGGER trigger_generate_extract_number
  BEFORE INSERT ON public.extracts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_extract_number();