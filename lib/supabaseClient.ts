
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// الوصول الآمن لمتغيرات البيئة (Vite Environment Variables)
const env = (import.meta as any).env || {};

// قراءة المتغيرات التي قمت بإعدادها في Vercel
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

// قيم احتياطية (فقط للبيئة المحلية أو في حال فشل قراءة المتغيرات)
const FALLBACK_URL = 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg';

const finalUrl = SUPABASE_URL || FALLBACK_URL;
const finalKey = SUPABASE_ANON_KEY || FALLBACK_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('تنبيه: يتم استخدام مفاتيح Supabase الاحتياطية. تأكد من إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في Vercel.');
}

// إنشاء العميل
export const supabase = createClient<Database>(
  finalUrl,
  finalKey,
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
  return !!finalUrl && !!finalKey;
};
