-- إضافة صلاحية عرض وإنشاء الموردين للمستخدم amarnory92
INSERT INTO public.user_permissions (user_id, page_name, can_view, can_create, can_edit, can_delete)
VALUES ('e7abd8e3-6015-4b20-870d-5284f861804b', 'suppliers', true, true, false, false)
ON CONFLICT ON CONSTRAINT user_permissions_pkey
DO NOTHING;