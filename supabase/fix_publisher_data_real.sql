
-- 1. تحديث دور المستخدم المحدد (الذي ظهر في الصورة) ليصبح 'publisher'
UPDATE public.profiles 
SET role = 'publisher' 
WHERE email = 'publisher@alrehlah.org';

-- 2. التأكد من وجود سجل في جدول الناشرين لهذا المستخدم
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- جلب معرّف المستخدم
    SELECT id INTO target_user_id FROM public.profiles WHERE email = 'publisher@alrehlah.org';

    IF target_user_id IS NOT NULL THEN
        -- إدخال بيانات الناشر الافتراضية إذا لم تكن موجودة
        INSERT INTO public.publisher_profiles (
            user_id, 
            store_name, 
            slug, 
            description, 
            logo_url, 
            website
        ) VALUES (
            target_user_id,
            'دار نشر الرحلة (الرسمية)', -- الاسم الافتراضي
            'alrehla-publisher',
            'نحن دار نشر متخصصة في أدب الطفل، نسعى لتقديم محتوى يجمع بين المتعة والفائدة.',
            'https://i.ibb.co/C0bSJJT/favicon.png', -- شعار افتراضي
            'https://alrehla.com'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            -- تحديث البيانات في حال كان السجل موجوداً لكنه ناقص
            store_name = EXCLUDED.store_name WHERE publisher_profiles.store_name IS NULL;
            
        RAISE NOTICE 'Publisher profile fixed for %', target_user_id;
    ELSE
        RAISE NOTICE 'User publisher@alrehlah.org not found in profiles table.';
    END IF;
END $$;

-- 3. تحديث صلاحيات الوصول للمنتجات (لضمان ظهورها للناشر)
-- (تم إضافته في خطوات سابقة ولكن نكرره للتأكيد)
ALTER TABLE public.personalized_products ENABLE ROW LEVEL SECURITY;

-- 4. تحديث الكاش لضمان ظهور التغييرات فوراً
NOTIFY pgrst, 'reload config';
