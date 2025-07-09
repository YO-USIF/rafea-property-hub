-- تغيير نوع البيانات للمبالغ من integer إلى numeric لدعم الأرقام العشرية

-- تحديث جدول المشتريات
ALTER TABLE public.purchases 
ALTER COLUMN total_amount TYPE NUMERIC(15,2);

-- تحديث جدول عناصر المشتريات  
ALTER TABLE public.purchase_items 
ALTER COLUMN unit_price TYPE NUMERIC(15,2);

-- تحديث جدول المبيعات
ALTER TABLE public.sales 
ALTER COLUMN price TYPE NUMERIC(15,2),
ALTER COLUMN remaining_amount TYPE NUMERIC(15,2);

-- تحديث جدول المشاريع
ALTER TABLE public.projects 
ALTER COLUMN total_cost TYPE NUMERIC(15,2);

-- تحديث جدول طلبات الصيانة
ALTER TABLE public.maintenance_requests 
ALTER COLUMN estimated_cost TYPE NUMERIC(15,2);