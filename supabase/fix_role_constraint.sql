
-- 1. إسقاط قيد التحقق القديم (إذا وجد) الذي يحدد القيم المسموحة
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. إعادة إضافة القيد مع تضمين 'publisher'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
CHECK (role IN (
    'user', 
    'parent', 
    'student', 
    'instructor', 
    'super_admin', 
    'general_supervisor', 
    'enha_lak_supervisor', 
    'creative_writing_supervisor', 
    'content_editor', 
    'support_agent', 
    'publisher'
));

-- 3. تحديث الكاش
NOTIFY pgrst, 'reload config';
