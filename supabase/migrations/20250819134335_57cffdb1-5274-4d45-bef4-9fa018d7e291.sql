-- إزالة العرض المؤقت وإعادة التصميم لتجنب مشكلة Security Definer
DROP VIEW IF EXISTS public.sales_secure;

-- بدلاً من استخدام عرض منفصل، سنعتمد على RLS policies فقط
-- تحديث سياسة RLS للمبيعات لتكون أكثر وضوحاً
DROP POLICY IF EXISTS "Users can view their own sales or system admins can view all" ON public.sales;

-- إنشاء سياسات RLS محدودة ومفصلة
CREATE POLICY "Users can view their own sales data"
ON public.sales
FOR SELECT
USING (auth.uid() = user_id);

-- سياسة منفصلة للمديرين (بدون استخدام SECURITY DEFINER functions في العرض)
CREATE POLICY "Managers can view sales data"
ON public.sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('مدير النظام', 'مدير')
  )
);