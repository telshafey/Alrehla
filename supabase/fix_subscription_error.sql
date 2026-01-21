
-- 1. Create a secure RPC function to allow the frontend to trigger a schema cache reload
-- This helps the app self-heal from "Could not find column" errors.
CREATE OR REPLACE FUNCTION reload_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY pgrst, 'reload config';
END;
$$;

-- 2. Ensure 'subscriptions' table exists and has the 'end_date' column
-- This prevents the specific error shown in the screenshot if the column was missing.
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    child_id BIGINT REFERENCES public.child_profiles(id),
    plan_name VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    next_renewal_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add end_date if it somehow doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'end_date') THEN
        ALTER TABLE public.subscriptions ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Trigger an immediate reload of the schema cache
NOTIFY pgrst, 'reload config';
