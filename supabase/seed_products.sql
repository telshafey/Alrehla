
-- 1. HERO STORIES (Upsert)
INSERT INTO public.personalized_products (
    key, title, product_type, description, image_url, features, sort_order, 
    is_featured, is_addon, is_active, has_printed_version, price_printed, 
    price_electronic, goal_config, story_goals, image_slots, text_fields
) VALUES
(
    'space_adventure',
    'مغامرة في الفضاء',
    'hero_story',
    'رحلة خيالية يأخذ فيها طفلك دور رائد فضاء شجاع يكتشف الكواكب والنجوم، ويتعلم أهمية العلم والاستكشاف.',
    'https://i.ibb.co/wznz4Xk/space-cover.jpg',
    '["بطل القصة هو طفلك (الاسم والصورة)", "تعزيز حب الاستكشاف والعلوم", "رسومات عالية الجودة وألوان زاهية"]'::jsonb,
    1, true, false, true, true, 450, 200,
    'predefined',
    '[{"key": "courage", "title": "الشجاعة"}, {"key": "curiosity", "title": "حب المعرفة"}, {"key": "teamwork", "title": "العمل الجماعي"}]'::jsonb,
    '[{"id": "child_photo", "label": "صورة البطل (وجه واضح)", "required": true}]'::jsonb,
    '[{"id": "dedication", "label": "إهداء (اختياري)", "type": "textarea", "required": false, "placeholder": "اكتب إهداء خاص ليطبع في الصفحة الأولى..."}]'::jsonb
),
(
    'jungle_king',
    'ملك الغابة الصغير',
    'hero_story',
    'قصة ممتعة في قلب الغابة، حيث يتعلم طفلك كيف يكون قائداً رحيماً ويساعد الحيوانات في حل مشاكلهم.',
    'https://i.ibb.co/3r0QyXz/jungle-cover.jpg',
    '["تعليم قيم القيادة والرحمة", "مغامرة ممتعة مع الحيوانات", "تخصيص كامل لملامح الطفل"]'::jsonb,
    2, false, false, true, true, 450, 200,
    'predefined_and_custom',
    '[{"key": "kindness", "title": "الرفق بالحيوان"}, {"key": "responsibility", "title": "تحمل المسؤولية"}]'::jsonb,
    '[{"id": "child_photo", "label": "صورة الطفل", "required": true}]'::jsonb,
    '[{"id": "favorite_animal", "label": "الحيوان المفضل للطفل", "type": "input", "required": true, "placeholder": "أسد، فيل، قرد..."}]'::jsonb
),
(
    'ocean_secret',
    'سر المحيط العميق',
    'hero_story',
    'غوص في أعماق البحار لاكتشاف عالم مليء بالألوان والعجائب، وتعلم درس مهم عن الحفاظ على البيئة.',
    'https://i.ibb.co/xqJ9zYh/ocean-cover.jpg',
    '["تنمية الوعي البيئي", "قصة مشوقة ومليئة بالخيال", "هدية مثالية لمحبي السباحة"]'::jsonb,
    3, false, false, true, true, 450, 200,
    'custom',
    '[]'::jsonb,
    '[{"id": "child_photo", "label": "صورة الطفل", "required": true}]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    product_type = EXCLUDED.product_type,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order,
    is_featured = EXCLUDED.is_featured,
    is_addon = EXCLUDED.is_addon,
    is_active = EXCLUDED.is_active,
    has_printed_version = EXCLUDED.has_printed_version,
    price_printed = EXCLUDED.price_printed,
    price_electronic = EXCLUDED.price_electronic,
    goal_config = EXCLUDED.goal_config,
    story_goals = EXCLUDED.story_goals,
    image_slots = EXCLUDED.image_slots,
    text_fields = EXCLUDED.text_fields;

-- 2. LIBRARY BOOKS (Upsert)
INSERT INTO public.personalized_products (
    key, title, product_type, description, image_url, features, sort_order, 
    is_featured, is_addon, is_active, has_printed_version, price_printed, 
    price_electronic, goal_config, image_slots
) VALUES
(
    'prophet_stories',
    'قصص الأنبياء للأطفال',
    'library_book',
    'مجموعة مختارة من قصص الأنبياء بأسلوب مبسط ومناسب للأطفال، مع رسومات توضيحية جميلة (بدون تجسيد).',
    'https://i.ibb.co/hMdJqKy/prophets-book.jpg',
    '["لغة عربية سهلة وسليمة", "دروس وعبر قيمة", "غلاف مخصص باسم طفلك"]'::jsonb,
    10, false, false, true, true, 350, 150,
    'none',
    '[{"id": "cover_photo", "label": "صورة للغلاف الخلفي (اختياري)", "required": false}]'::jsonb
),
(
    'science_encyclopedia',
    'موسوعة المستكشف الصغير',
    'library_book',
    'رحلة في عالم العلوم، الفضاء، جسم الإنسان، والطبيعة. مليئة بالحقائق المدهشة والصور.',
    'https://i.ibb.co/KjqF8Lw/science-book.jpg',
    '["معلومات علمية دقيقة ومبسطة", "تنمي حب المعرفة", "طباعة فاخرة وغلاف مخصص"]'::jsonb,
    11, true, false, true, true, 400, null,
    'none',
    '[{"id": "cover_photo", "label": "صورة الطفل (ستوضع في إطار رائد الفضاء)", "required": true}]'::jsonb
),
(
    'manners_book',
    'حديقة الأخلاق',
    'library_book',
    'قصص قصيرة تعلم الأطفال الآداب الإسلامية والأخلاق الحميدة في التعامل مع الأسرة والجيران والأصدقاء.',
    'https://i.ibb.co/tHPq9Yn/manners-book.jpg',
    '["تربية سلوكية ممتعة", "مواقف من الحياة اليومية", "غلاف يحمل اسم طفلك"]'::jsonb,
    12, false, false, true, true, 300, 120,
    'none',
    '[]'::jsonb
),
(
    'bedtime_tales',
    'حكايات قبل النوم',
    'library_book',
    'مجموعة هادئة ولطيفة من القصص الخيالية القصيرة لتساعد طفلك على الاسترخاء والنوم بأحلام سعيدة.',
    'https://i.ibb.co/D8z2LqM/bedtime-book.jpg',
    '["نصوص مريحة وهادئة", "تعزز العلاقة بين الطفل والوالدين", "غلاف ليلي مميز باسم الطفل"]'::jsonb,
    13, false, false, true, true, 320, 130,
    'none',
    '[]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    product_type = EXCLUDED.product_type,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order,
    is_featured = EXCLUDED.is_featured,
    is_addon = EXCLUDED.is_addon,
    is_active = EXCLUDED.is_active,
    has_printed_version = EXCLUDED.has_printed_version,
    price_printed = EXCLUDED.price_printed,
    price_electronic = EXCLUDED.price_electronic,
    goal_config = EXCLUDED.goal_config,
    image_slots = EXCLUDED.image_slots;

-- 3. ADDONS (Upsert)
INSERT INTO public.personalized_products (
    key, title, product_type, description, image_url, features, sort_order, 
    is_featured, is_addon, is_active, has_printed_version, price_printed, 
    price_electronic, goal_config
) VALUES
(
    'coloring_book',
    'دفتر تلوين الأبطال',
    'hero_story', 
    'دفتر تلوين يحتوي على شخصيات القصة ومشاهد منها، ليقوم الطفل بتلوين مغامرته بنفسه.',
    'https://i.ibb.co/GxsJqXy/coloring-book.jpg',
    '["رسومات جاهزة للتلوين", "تنمي المهارات الفنية", "امتداد لتجربة القصة"]'::jsonb,
    50, false, true, true, true, 80, null, 'none'
),
(
    'sticker_pack',
    'ملصقات اسمي',
    'hero_story',
    'مجموعة ملصقات (Stickers) عالية الجودة تحمل اسم طفلك وشخصيات كرتونية لطيفة.',
    'https://i.ibb.co/C0bSJJT/favicon.png', 
    '["تستخدم للكتب والأدوات المدرسية", "تصاميم متنوعة وجذابة", "مقاومة للماء"]'::jsonb,
    51, false, true, true, true, 50, null, 'none'
)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    product_type = EXCLUDED.product_type,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order,
    is_featured = EXCLUDED.is_featured,
    is_addon = EXCLUDED.is_addon,
    is_active = EXCLUDED.is_active,
    has_printed_version = EXCLUDED.has_printed_version,
    price_printed = EXCLUDED.price_printed,
    price_electronic = EXCLUDED.price_electronic,
    goal_config = EXCLUDED.goal_config;

-- Ensure Subscription Box exists properly configured
UPDATE public.personalized_products
SET 
    product_type = 'subscription_box',
    is_active = true,
    sort_order = -1
WHERE key = 'subscription_box';
