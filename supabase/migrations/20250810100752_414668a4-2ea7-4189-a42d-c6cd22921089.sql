-- تعديل سياسات الأمان للسماح لجميع المستخدمين برؤية جميع البيانات

-- المشاريع
DROP POLICY IF EXISTS "Users can view projects" ON projects;
CREATE POLICY "All users can view all projects" ON projects FOR SELECT USING (true);

-- المبيعات  
DROP POLICY IF EXISTS "Users can view sales" ON sales;
CREATE POLICY "All users can view all sales" ON sales FOR SELECT USING (true);

-- المقاولين
DROP POLICY IF EXISTS "Users can view contractors" ON contractors;
CREATE POLICY "All users can view all contractors" ON contractors FOR SELECT USING (true);

-- الموردين
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
CREATE POLICY "All users can view all suppliers" ON suppliers FOR SELECT USING (true);

-- المستخلصات
DROP POLICY IF EXISTS "Users can view extracts" ON extracts;
CREATE POLICY "All users can view all extracts" ON extracts FOR SELECT USING (true);

-- الفواتير
DROP POLICY IF EXISTS "Users can view invoices" ON invoices;
CREATE POLICY "All users can view all invoices" ON invoices FOR SELECT USING (true);

-- المشتريات
DROP POLICY IF EXISTS "Users can view purchases" ON purchases;
CREATE POLICY "All users can view all purchases" ON purchases FOR SELECT USING (true);

-- طلبات الصيانة
DROP POLICY IF EXISTS "Users can view maintenance requests" ON maintenance_requests;
CREATE POLICY "All users can view all maintenance requests" ON maintenance_requests FOR SELECT USING (true);

-- المهام
DROP POLICY IF EXISTS "Users can view tasks" ON tasks;
CREATE POLICY "All users can view all tasks" ON tasks FOR SELECT USING (true);