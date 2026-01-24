
-- إصلاح أذونات الإشعارات (Notifications RLS)
-- المشكلة: المستخدم العادي (طالب/ولي أمر) لا يملك صلاحية إنشاء إشعار لمستخدم آخر (مدير/مدرب).

-- 1. تفعيل RLS (للتأكد)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. حذف السياسات القديمة المقيدة (لتجنب التكرار)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- 3. السماح للمستخدمين برؤية إشعاراتهم الخاصة فقط
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 4. السماح بتحديث الإشعارات الخاصة (لجعلها مقروءة)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. السماح لأي مستخدم مسجل بإنشاء إشعار لأي مستخدم آخر
-- (هذا ضروري لكي يتمكن الطالب من إشعار المدرب أو الإدارة عند حدوث إجراء)
CREATE POLICY "Allow creating notifications for others" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- إصلاح أذونات قراءة الملفات الشخصية (Profiles RLS)
-- المشكلة: النظام يحتاج لمعرفة "من هم المدراء" لإرسال الإشعار، والطالب قد لا يملك صلاحية البحث في جدول المستخدمين.

-- 1. السماح للجميع بقراءة البيانات الأساسية للمستخدمين (الاسم، الرتبة، المعرف)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
