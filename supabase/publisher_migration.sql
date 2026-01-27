
-- 1. Add publisher_id column to personalized_products
ALTER TABLE public.personalized_products 
ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES public.profiles(id);

-- 2. Update RLS Policies for Personalized Products

-- Drop existing policies to recreate them with publisher logic
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personalized_products;
DROP POLICY IF EXISTS "Enable write access for admins" ON public.personalized_products;

-- Allow everyone to read active products
CREATE POLICY "Enable read access for all users" ON public.personalized_products
    FOR SELECT USING (
        -- Admins and Publishers can see all (or their own) including inactive
        (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'general_supervisor', 'enha_lak_supervisor', 'publisher')))
        OR 
        -- Public users only see active products
        (is_active = true)
    );

-- Allow Admins full write access
CREATE POLICY "Enable write access for admins" ON public.personalized_products
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor', 'enha_lak_supervisor')
        )
    );

-- Allow Publishers to manage ONLY their own products
CREATE POLICY "Enable write access for publishers" ON public.personalized_products
    FOR ALL USING (
        publisher_id = auth.uid() 
        AND 
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'publisher'
        )
    )
    WITH CHECK (
        publisher_id = auth.uid()
    );

-- 3. Notify Schema Reload
NOTIFY pgrst, 'reload config';
