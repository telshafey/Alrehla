import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// استخدام المتغيرات مباشرة بدون config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// للتشخيص المؤقت
console.log('Supabase URL:', SUPABASE_URL);
console.log('Anon Key exists:', !!SUPABASE_ANON_KEY);

// إنشاء العميل الرئيسي
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export const getTemporaryClient = () => {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};
