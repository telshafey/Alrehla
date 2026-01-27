
-- 1. Create Publisher Payouts Table
CREATE TABLE IF NOT EXISTS public.publisher_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.publisher_payouts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Admins manage publisher payouts" ON public.publisher_payouts;
DROP POLICY IF EXISTS "Publishers view own payouts" ON public.publisher_payouts;

-- Admin: Full Access
CREATE POLICY "Admins manage publisher payouts" ON public.publisher_payouts
    FOR ALL USING (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'general_supervisor')
        )
    );

-- Publisher: View Only Own Payouts
CREATE POLICY "Publishers view own payouts" ON public.publisher_payouts
    FOR SELECT USING (
        publisher_id = auth.uid()
    );

-- 4. Reload Cache
NOTIFY pgrst, 'reload config';
