-- منح صلاحيات كاملة للمستخدم rawah901219 على جميع الصفحات
INSERT INTO user_permissions (user_id, page_name, can_view, can_create, can_edit, can_delete)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'rawah901219@gmail.com' LIMIT 1) as user_id,
  page,
  true,
  true,
  true,
  true
FROM (
  VALUES 
    ('dashboard'),
    ('projects'),
    ('sales'),
    ('purchases'),
    ('suppliers'),
    ('contractors'),
    ('extracts'),
    ('invoices'),
    ('maintenance'),
    ('tasks'),
    ('warehouse'),
    ('accounting'),
    ('reports'),
    ('settings')
) AS pages(page)
ON CONFLICT (user_id, page_name) 
DO UPDATE SET 
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  updated_at = now();