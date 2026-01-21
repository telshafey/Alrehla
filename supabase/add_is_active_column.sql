
-- 1. Add is_active column if it doesn't exist
ALTER TABLE public.personalized_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Force refresh of Supabase schema cache to recognize the new column
NOTIFY pgrst, 'reload config';
