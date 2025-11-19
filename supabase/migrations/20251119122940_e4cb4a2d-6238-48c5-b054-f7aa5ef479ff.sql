-- إصلاح مشكلة الأمان: إعادة customer_name إلى sales والاحتفاظ فقط بالبيانات الحساسة في customers

-- تحديث سياسات جدول customers للسماح بالوصول لبيانات العملاء في مبيعات المستخدم
DROP POLICY IF EXISTS "Only admins can view customer data" ON customers;

CREATE POLICY "Users can view customers in their own sales"
ON customers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE sales.customer_id = customers.id 
    AND sales.user_id = auth.uid()
  )
  OR is_manager_or_admin()
);

-- تحديث سياسة الإنشاء
DROP POLICY IF EXISTS "Only admins can create customers" ON customers;

CREATE POLICY "Authenticated users can create customers"
ON customers FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- تحديث سياسة التعديل
DROP POLICY IF EXISTS "Only admins can update customers" ON customers;

CREATE POLICY "Users can update customers in their sales"
ON customers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE sales.customer_id = customers.id 
    AND sales.user_id = auth.uid()
  )
  OR is_manager_or_admin()
);

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_sales_user_customer ON sales(user_id, customer_id);