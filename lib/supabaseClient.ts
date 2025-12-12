
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// قراءة متغيرات البيئة. في Vercel ستضيف هذه المتغيرات في لوحة التحكم.
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are not provided. The app will run in mock mode or fail.');
}

// إنشاء العميل
export const supabase = createClient<Database>(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);

// Helper function used in some services
export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};
