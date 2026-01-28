
-- إصلاح أذونات الإشعارات (Notifications RLS)
-- هذا السكربت يقوم بحذف السياسات القديمة وإعادة إنشائها لتجنب أخطاء التكرار

-- 1. تفعيل RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. حذف السياسات القديمة (لتجنب الخطأ: policy already exists)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow creating notifications for others" ON public.notifications;

-- 3. إعادة إنشاء السياسات
-- السماح للمستخدمين برؤية إشعاراتهم الخاصة فقط
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- السماح للمستخدم بتحديث إشعاراته (مثلاً: تعليمها كمقروءة)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- السماح لأي مستخدم مسجل بإنشاء إشعار لأي مستخدم آخر (مهم للتفاعل بين الطلاب والمدربين)
CREATE POLICY "Allow creating notifications for others" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. تفعيل Realtime للجدول
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. إصلاح أذونات قراءة الملفات الشخصية (ضروري لإرسال الإشعارات للمشرفين)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- تحديث الكاش
NOTIFY pgrst, 'reload config';
