-- إضافة علاقة مباشرة بين المبيعات والمشاريع
ALTER TABLE sales ADD COLUMN project_id UUID;

-- إضافة مفتاح خارجي للربط مع جدول المشاريع
ALTER TABLE sales ADD CONSTRAINT fk_sales_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX idx_sales_project_id ON sales(project_id);

-- تحديث السجلات الموجودة بربطها بالمشاريع المناسبة بناءً على الأسماء
UPDATE sales 
SET project_id = (
  SELECT p.id 
  FROM projects p 
  WHERE TRIM(p.name) = TRIM(sales.project_name)
  LIMIT 1
)
WHERE project_name IS NOT NULL;