
-- 1. Create site_settings table (Key-Value Store)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;
DROP POLICY IF EXISTS "Enable write access for admins" ON public.site_settings;

-- Policy: Everyone can read
CREATE POLICY "Enable read access for all users" ON public.site_settings
    FOR SELECT USING (true);

-- Policy: Only Admins can update/insert
CREATE POLICY "Enable write access for admins" ON public.site_settings
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor')
        )
    );

-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_description VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "Admins can view logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert logs" ON public.audit_logs;

-- Policy: Admins can read logs
CREATE POLICY "Admins can view logs" ON public.audit_logs
    FOR SELECT USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor')
        )
    );

-- Policy: Any authenticated user can insert logs (system triggers this)
CREATE POLICY "Users can insert logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Create instructor_payouts table
CREATE TABLE IF NOT EXISTS public.instructor_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id BIGINT REFERENCES public.instructors(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for instructor_payouts
ALTER TABLE public.instructor_payouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "Admins manage payouts" ON public.instructor_payouts;
DROP POLICY IF EXISTS "Instructors view own payouts" ON public.instructor_payouts;

-- Policy: Admins can manage payouts
CREATE POLICY "Admins manage payouts" ON public.instructor_payouts
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor')
        )
    );

-- Policy: Instructors can view their own payouts
CREATE POLICY "Instructors view own payouts" ON public.instructor_payouts
    FOR SELECT USING (
        exists (
            select 1 from public.instructors
            where instructors.id = instructor_payouts.instructor_id
            and instructors.user_id = auth.uid()
        )
    );
