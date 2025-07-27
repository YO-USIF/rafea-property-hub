-- حذف الإشعارات التجريبية الموجودة
DELETE FROM public.notifications 
WHERE message LIKE '%مشروع تجريبي%' 
   OR message LIKE '%A101%' 
   OR message LIKE '%مقاول جديد%' 
   OR message LIKE '%شركة الكهرباء%' 
   OR message LIKE '%مبنى الورود%'
   OR message LIKE '%تقرير شهري%';