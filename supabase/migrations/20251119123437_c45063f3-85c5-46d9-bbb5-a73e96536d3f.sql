-- تحديث دور المستخدم rawah901219 إلى مدير
UPDATE user_roles 
SET role = 'مدير'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'rawah901219@gmail.com' 
  LIMIT 1
);