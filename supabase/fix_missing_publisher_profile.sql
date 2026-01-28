
-- هذا السكربت يضمن وجود ملف تعريف لدار النشر للحساب التجريبي (Demo Publisher)
-- يفترض أن البريد الإلكتروني للحساب هو 'publisher@alrehlah.com' أو يبحث عن أي مستخدم بدور 'publisher'

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. محاولة العثور على المستخدم التجريبي
    SELECT id INTO target_user_id FROM public.profiles WHERE email = 'publisher@alrehlah.com';

    -- 2. إذا لم يوجد، ابحث عن أي مستخدم برتبة publisher
    IF target_user_id IS NULL THEN
        SELECT id INTO target_user_id FROM public.profiles WHERE role = 'publisher' LIMIT 1;
    END IF;

    -- 3. إذا وجدنا مستخدماً، ننشئ له ملف دار نشر
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.publisher_profiles (
            user_id, 
            store_name, 
            slug, 
            description, 
            logo_url, 
            website
        ) VALUES (
            target_user_id,
            'دار نشر الرحلة',
            'alrehla-publisher',
            'الدار الرسمية لمنصة الرحلة، نقدم أفضل القصص المخصصة والمحتوى التربوي الهادف للأطفال في الوطن العربي.',
            'https://i.ibb.co/C0bSJJT/favicon.png',
            'https://alrehla.com'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name = EXCLUDED.store_name,
            description = EXCLUDED.description,
            logo_url = EXCLUDED.logo_url;
    END IF;
END $$;

-- 4. تحديث الكاش
NOTIFY pgrst, 'reload config';
