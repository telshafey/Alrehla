
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// الوصول الآمن لمتغيرات البيئة
const env = (import.meta as any).env || {};

// محاولة قراءة المتغيرات من ملف .env أولاً (Best Practice)
// إذا لم تكن موجودة، نستخدم القيم المضمنة (للنسخة التجريبية الحالية)
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('تنبيه: بيانات الاتصال بـ Supabase مفقودة. يرجى التأكد من ملف .env');
}

// إنشاء العميل
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

// Helper function used in some services
export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};
