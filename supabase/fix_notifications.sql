
-- إصلاح أذونات الإشعارات (Notifications RLS)

-- 1. تفعيل RLS (أمان مستوى الصف)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. حذف السياسات القديمة لتجنب التكرار
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

-- 4. تفعيل Realtime للجدول (مع التحقق المسبق)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 5. إصلاح أذونات قراءة الملفات الشخصية (ضروري لإرسال الإشعارات للمشرفين)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- تحديث الكاش
NOTIFY pgrst, 'reload config';
