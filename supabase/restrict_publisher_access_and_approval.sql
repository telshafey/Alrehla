
-- 1. ADD Approval Column
ALTER TABLE public.personalized_products 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved';

-- 2. RESET RLS POLICIES (Strict Visibility)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personalized_products;
DROP POLICY IF EXISTS "Enable write access for admins" ON public.personalized_products;
DROP POLICY IF EXISTS "Enable write access for publishers" ON public.personalized_products;

-- READ Policy: 
-- Admins: See ALL.
-- Publishers: See ONLY their own.
-- Public/Users: See ONLY active AND approved.
CREATE POLICY "Strict product visibility" ON public.personalized_products
    FOR SELECT USING (
        -- Admin Access
        (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin', 'general_supervisor', 'enha_lak_supervisor')))
        OR 
        -- Publisher Access (Own items only)
        (publisher_id = auth.uid())
        OR 
        -- Public Access
        (is_active = true AND approval_status = 'approved')
    );

-- WRITE Policy (Admins): Full Access
CREATE POLICY "Admins full write access" ON public.personalized_products
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor', 'enha_lak_supervisor')
        )
    );

-- WRITE Policy (Publishers): Own items only
CREATE POLICY "Publishers manage own items" ON public.personalized_products
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

-- 3. TRIGGER FUNCTION: Force Pending Status on Publisher Updates
CREATE OR REPLACE FUNCTION force_product_pending_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is a publisher (not an admin)
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'publisher') THEN
        -- Force status to pending and inactive
        NEW.approval_status := 'pending';
        NEW.is_active := false;
        
        -- Ensure they cannot claim others' products
        NEW.publisher_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS tr_force_product_pending ON public.personalized_products;

-- Create Trigger
CREATE TRIGGER tr_force_product_pending
BEFORE INSERT OR UPDATE ON public.personalized_products
FOR EACH ROW
EXECUTE FUNCTION force_product_pending_status();

-- 4. RELOAD CACHE
NOTIFY pgrst, 'reload config';
