
-- تنظيف جدول الإشعارات بالكامل لإزالة البيانات الوهمية القديمة
TRUNCATE TABLE public.notifications;

-- (اختياري) إذا كنت تريد حذف الإشعارات القديمة فقط وإبقاء الحديثة
-- DELETE FROM public.notifications WHERE created_at < NOW() - INTERVAL '1 day';

-- تحديث الكاش (لضمان أن الواجهة الأمامية تستشعر التغيير فوراً)
NOTIFY pgrst, 'reload config';
