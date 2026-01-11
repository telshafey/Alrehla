
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// القيم الاحتياطية (للاستخدام المحلي فقط أو في حال الطوارئ)
const FALLBACK_URL = 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg';

// محاولة استخراج المتغيرات بطريقة آمنة جداً باستخدام السلسلة الاختيارية (?.)
// هذا يمنع الخطأ "Cannot read properties of undefined"
let envUrl = '';
let envKey = '';

try {
    // @ts-ignore
    envUrl = import.meta.env?.VITE_SUPABASE_URL;
    // @ts-ignore
    envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
} catch (e) {
    console.log("Using fallback credentials due to environment access issue.");
}

// تحديد القيم النهائية (الأولوية لمتغيرات البيئة)
const finalUrl = (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') ? envUrl : FALLBACK_URL;
const finalKey = (envKey && typeof envKey === 'string' && envKey.trim() !== '') ? envKey : FALLBACK_KEY;

// طباعة رسالة معلومات فقط (ليست تحذيراً)
if (finalUrl === FALLBACK_URL) {
  console.info('Using default Supabase connection.');
}

// إنشاء العميل الرئيسي
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

/**
 * إنشاء عميل مؤقت لا يحفظ الجلسة في المتصفح.
 * يستخدم لإنشاء حسابات فرعية (مثل الطلاب) دون تسجيل خروج ولي الأمر.
 */
export const getTemporaryClient = () => {
    return createClient<Database>(finalUrl, finalKey, {
        auth: {
            persistSession: false, // مهم جداً: منع حفظ الجلسة
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

// دالة مساعدة
export const hasSupabaseCredentials = () => {
  return true;
};
