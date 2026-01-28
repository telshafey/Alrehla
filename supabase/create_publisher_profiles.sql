
-- 1. Create publisher_profiles table
CREATE TABLE IF NOT EXISTS public.publisher_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add Unique constraint on user_id to ensure one profile per publisher
ALTER TABLE public.publisher_profiles ADD CONSTRAINT unique_publisher_user UNIQUE (user_id);

-- 3. Enable RLS
ALTER TABLE public.publisher_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public Read Access
CREATE POLICY "Public profiles are viewable by everyone" ON public.publisher_profiles
    FOR SELECT USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage publisher profiles" ON public.publisher_profiles
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor')
        )
    );

-- Publishers can insert/update their OWN profile
CREATE POLICY "Publishers manage own profile" ON public.publisher_profiles
    FOR ALL USING (
        user_id = auth.uid()
    )
    WITH CHECK (
        user_id = auth.uid()
    );

-- 5. Reload Cache
NOTIFY pgrst, 'reload config';
