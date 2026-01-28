
-- 1. Insert Profile for "Dar El Shourouk"
INSERT INTO public.profiles (id, email, name, role, created_at)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'shourouk@demo.com', 'دار الشروق', 'publisher', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Publisher Profile
INSERT INTO public.publisher_profiles (user_id, store_name, slug, description, logo_url, website)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'دار الشروق', 'dar-el-shourouk', 'من أعرق دور النشر في مصر والعالم العربي، تقدم محتوى متميز للأطفال.', 'https://upload.wikimedia.org/wikipedia/ar/7/7a/Dar_El_Shorouk_Logo.png', 'https://shorouk.com')
ON CONFLICT (user_id) DO NOTHING;


-- 3. Insert Profile for "Nahdet Misr"
INSERT INTO public.profiles (id, email, name, role, created_at)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'nahda@demo.com', 'نهضة مصر', 'publisher', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Publisher Profile
INSERT INTO public.publisher_profiles (user_id, store_name, slug, description, logo_url, website)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'نهضة مصر', 'nahdet-misr', 'مجموعة رائدة في مجال النشر التعليمي والثقافي لأكثر من 80 عاماً.', 'https://yt3.googleusercontent.com/ytc/AIdro_nGEy_QJO_sXFk_d4lTjWv5vC9Q_gC9_qC9_qC9=s900-c-k-c0x00ffffff-no-rj', 'https://www.nahdetmisr.com')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Reload Cache
NOTIFY pgrst, 'reload config';
