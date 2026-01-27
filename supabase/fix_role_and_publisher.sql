
-- 1. FIX ROLE CONSTRAINT (Ensure publisher is allowed)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
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

-- 2. ADD PUBLISHER_ID TO PRODUCTS (If missing)
ALTER TABLE public.personalized_products 
ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES public.profiles(id);

-- 3. ENABLE RLS ON PRODUCTS
ALTER TABLE public.personalized_products ENABLE ROW LEVEL SECURITY;

-- 4. REFRESH PRODUCT POLICIES (Fix permissions)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personalized_products;
DROP POLICY IF EXISTS "Enable write access for admins" ON public.personalized_products;
DROP POLICY IF EXISTS "Enable write access for publishers" ON public.personalized_products;

-- Read Policy
CREATE POLICY "Enable read access for all users" ON public.personalized_products
    FOR SELECT USING (
        -- Admins and Publishers can see all (or their own) including inactive
        (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'general_supervisor', 'enha_lak_supervisor', 'publisher')))
        OR 
        -- Public users only see active products
        (is_active = true)
    );

-- Write Policy (Admins)
CREATE POLICY "Enable write access for admins" ON public.personalized_products
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor', 'enha_lak_supervisor')
        )
    );

-- Write Policy (Publishers - Own products only)
CREATE POLICY "Enable write access for publishers" ON public.personalized_products
    FOR ALL USING (
        publisher_id = auth.uid() 
    )
    WITH CHECK (
        publisher_id = auth.uid()
    );

-- 5. RELOAD CACHE
NOTIFY pgrst, 'reload config';
