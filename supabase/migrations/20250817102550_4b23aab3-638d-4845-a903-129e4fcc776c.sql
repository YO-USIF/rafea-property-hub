-- Fix remaining security warnings from the linter

-- 1. Fix remaining functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- إنشاء ملف تعريف المستخدم
  INSERT INTO public.profiles (user_id, full_name, email, status)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    NEW.email,
    'نشط'
  );
  
  -- إضافة صلاحية افتراضية
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'موظف');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_journal_entry_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- التحقق من أن إجمالي المدين = إجمالي الدائن
  UPDATE public.journal_entries 
  SET 
    total_debit = (SELECT COALESCE(SUM(debit_amount), 0) FROM public.journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id),
    total_credit = (SELECT COALESCE(SUM(credit_amount), 0) FROM public.journal_entry_lines WHERE journal_entry_id = NEW.journal_entry_id)
  WHERE id = NEW.journal_entry_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;