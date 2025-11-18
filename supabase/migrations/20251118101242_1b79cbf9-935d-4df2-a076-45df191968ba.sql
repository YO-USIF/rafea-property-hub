-- تحديث دور المستخدم reyad908@gmail.com إلى مدير مشروع
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'reyad908@gmail.com'),
  'مدير مشروع'
)
ON CONFLICT (user_id, role) DO NOTHING;