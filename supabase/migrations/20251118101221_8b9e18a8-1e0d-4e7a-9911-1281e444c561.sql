-- إضافة قيمة "مدير مشروع" فقط للـ enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'مدير مشروع';