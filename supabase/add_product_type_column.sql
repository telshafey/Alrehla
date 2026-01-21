
-- 1. Add the new column 'product_type'
ALTER TABLE public.personalized_products 
ADD COLUMN product_type VARCHAR(50) DEFAULT 'hero_story';

-- 2. Update existing products based on logic
-- Make 'subscription_box' explicitly a subscription type
UPDATE public.personalized_products 
SET product_type = 'subscription_box' 
WHERE key = 'subscription_box';

-- Default others remain 'hero_story' (Current fully personalized stories)

-- 3. Reload Schema Cache to make Supabase aware of the change immediately
NOTIFY pgrst, 'reload config';
