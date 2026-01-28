
-- هذا السكربت يضمن وجود سجل في جدول publisher_profiles للمستخدم الحالي.
-- مفيد لتمكين التعديل إذا لم يتم إنشاء السجل عند التسجيل.

DO $$
DECLARE
    -- يمكن استبدال هذا بالبريد الإلكتروني للمستخدم المستهدف إذا لزم الأمر
    target_email TEXT := 'publisher@alrehlah.com'; 
    target_user_id UUID;
    existing_profile_id INTEGER;
BEGIN
    -- 1. البحث عن المستخدم
    SELECT id INTO target_user_id FROM public.profiles WHERE email = target_email;

    -- 2. إذا لم يتم العثور على المستخدم بالبريد، حاول البحث عن أي مستخدم برتبة 'publisher'
    IF target_user_id IS NULL THEN
        SELECT id INTO target_user_id FROM public.profiles WHERE role = 'publisher' LIMIT 1;
    END IF;

    IF target_user_id IS NOT NULL THEN
        -- 3. التحقق من وجود ملف ناشر
        SELECT id INTO existing_profile_id FROM public.publisher_profiles WHERE user_id = target_user_id;

        -- 4. إذا لم يوجد، قم بإنشائه ببيانات افتراضية
        IF existing_profile_id IS NULL THEN
            INSERT INTO public.publisher_profiles (
                user_id,
                store_name,
                slug,
                description,
                logo_url,
                website,
                created_at
            ) VALUES (
                target_user_id,
                'دار نشر جديدة',
                'new-publisher-' || substr(md5(random()::text), 1, 6),
                'يرجى تحديث وصف الدار من إعدادات الحساب.',
                'https://i.ibb.co/C0bSJJT/favicon.png', -- Default logo
                '',
                NOW()
            );
            RAISE NOTICE 'Created new publisher profile for user %', target_user_id;
        ELSE
            RAISE NOTICE 'Publisher profile already exists for user %', target_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'No publisher user found to seed.';
    END IF;
END $$;

-- تحديث كاش Supabase
NOTIFY pgrst, 'reload config';
