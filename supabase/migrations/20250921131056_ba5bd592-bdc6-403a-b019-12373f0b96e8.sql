-- تحديث السجلات الموجودة لربط project_id بناءً على project_name بدقة أكبر

-- ربط "سهيل رزدنس A"
UPDATE sales 
SET project_id = '0f448370-7513-444d-9b35-81be67814c2d'
WHERE project_name LIKE '%سهيل رزدنس A%' AND project_id IS NULL;

-- ربط "سهيل رزدنس B"  
UPDATE sales 
SET project_id = '7556d87f-5464-4aff-8c2b-857c972764ab'
WHERE project_name LIKE '%سهيل رزدنس B%' AND project_id IS NULL;

-- ربط "مشروع سهيل طيبة 5"
UPDATE sales 
SET project_id = '4d77ee8c-8bfa-421b-b0a3-15e3a3c9ab74'
WHERE project_name LIKE '%مشروع سهيل طيبة 5%' AND project_id IS NULL;

-- تحديث أي سجلات أخرى لم يتم ربطها بعد
UPDATE sales 
SET project_id = (
  SELECT p.id 
  FROM projects p 
  WHERE TRIM(LOWER(p.name)) = TRIM(LOWER(sales.project_name))
  LIMIT 1
)
WHERE project_id IS NULL AND project_name IS NOT NULL;