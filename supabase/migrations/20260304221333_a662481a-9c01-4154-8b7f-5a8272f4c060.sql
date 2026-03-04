
-- جدول تسليم الوحدات السكنية
CREATE TABLE public.unit_handovers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  project_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'شقة',
  floor_number TEXT,
  building_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_id_number TEXT,
  handover_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'قيد التسليم',
  -- قراءات العدادات
  electricity_meter_reading TEXT,
  water_meter_reading TEXT,
  -- المفاتيح
  keys_delivered INTEGER DEFAULT 0,
  keys_description TEXT,
  -- قائمة الفحص
  check_electricity BOOLEAN DEFAULT false,
  check_plumbing BOOLEAN DEFAULT false,
  check_painting BOOLEAN DEFAULT false,
  check_flooring BOOLEAN DEFAULT false,
  check_doors_windows BOOLEAN DEFAULT false,
  check_ac BOOLEAN DEFAULT false,
  check_kitchen BOOLEAN DEFAULT false,
  check_bathrooms BOOLEAN DEFAULT false,
  -- ضمانات
  warranty_period_months INTEGER DEFAULT 12,
  warranty_notes TEXT,
  -- ملاحظات ومرفقات
  notes TEXT,
  attached_file_url TEXT,
  attached_file_name TEXT,
  -- التوقيع
  customer_signature_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.unit_handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on unit_handovers based on permissions" ON public.unit_handovers FOR SELECT TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'view'));
CREATE POLICY "Allow INSERT on unit_handovers based on permissions" ON public.unit_handovers FOR INSERT TO authenticated WITH CHECK (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'create'));
CREATE POLICY "Allow UPDATE on unit_handovers based on permissions" ON public.unit_handovers FOR UPDATE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'));
CREATE POLICY "Allow DELETE on unit_handovers based on permissions" ON public.unit_handovers FOR DELETE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'delete'));

-- جدول أعضاء اتحاد الملاك
CREATE TABLE public.hoa_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  project_name TEXT NOT NULL,
  member_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  unit_number TEXT NOT NULL,
  building_name TEXT NOT NULL,
  membership_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'نشط',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoa_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on hoa_members based on permissions" ON public.hoa_members FOR SELECT TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'view'));
CREATE POLICY "Allow INSERT on hoa_members based on permissions" ON public.hoa_members FOR INSERT TO authenticated WITH CHECK (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'create'));
CREATE POLICY "Allow UPDATE on hoa_members based on permissions" ON public.hoa_members FOR UPDATE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'));
CREATE POLICY "Allow DELETE on hoa_members based on permissions" ON public.hoa_members FOR DELETE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'delete'));

-- جدول رسوم اتحاد الملاك
CREATE TABLE public.hoa_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  member_id UUID REFERENCES public.hoa_members(id) ON DELETE CASCADE NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'صيانة شهرية',
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'غير مدفوع',
  period TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoa_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on hoa_fees based on permissions" ON public.hoa_fees FOR SELECT TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'view'));
CREATE POLICY "Allow INSERT on hoa_fees based on permissions" ON public.hoa_fees FOR INSERT TO authenticated WITH CHECK (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'create'));
CREATE POLICY "Allow UPDATE on hoa_fees based on permissions" ON public.hoa_fees FOR UPDATE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'edit'));
CREATE POLICY "Allow DELETE on hoa_fees based on permissions" ON public.hoa_fees FOR DELETE TO authenticated USING (is_admin() OR check_user_permission(auth.uid(), 'maintenance', 'delete'));
