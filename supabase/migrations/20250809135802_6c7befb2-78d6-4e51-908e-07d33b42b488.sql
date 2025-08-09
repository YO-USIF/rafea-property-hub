-- نقل ملكية المقاولين إلى المستخدم الحالي
UPDATE contractors 
SET user_id = '5efdcb10-c18d-4cf0-9e72-185623d0f537'
WHERE user_id = 'e7abd8e3-6015-4b20-870d-5284f861804b';

-- نقل ملكية المستخلصات المرتبطة بهؤلاء المقاولين إلى المستخدم الحالي
UPDATE extracts 
SET user_id = '5efdcb10-c18d-4cf0-9e72-185623d0f537'
WHERE user_id = 'e7abd8e3-6015-4b20-870d-5284f861804b';

-- تحديث أي فواتير مرتبطة أيضاً
UPDATE invoices 
SET user_id = '5efdcb10-c18d-4cf0-9e72-185623d0f537'
WHERE user_id = 'e7abd8e3-6015-4b20-870d-5284f861804b';

-- تحديث أي مشتريات مرتبطة أيضاً
UPDATE purchases 
SET user_id = '5efdcb10-c18d-4cf0-9e72-185623d0f537'
WHERE user_id = 'e7abd8e3-6015-4b20-870d-5284f861804b';