
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { DEFAULT_CONFIG } from './config';

// استخدام القيم من ملف التكوين المركزي
const SUPABASE_URL = DEFAULT_CONFIG.supabase.projectUrl;
const SUPABASE_ANON_KEY = DEFAULT_CONFIG.supabase.anonKey;

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

/**
 * إنشاء عميل مؤقت لا يحفظ الجلسة في المتصفح.
 * يستخدم لإنشاء حسابات فرعية (مثل الطلاب) دون تسجيل خروج ولي الأمر.
 */
export const getTemporaryClient = () => {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false, // مهم جداً: منع حفظ الجلسة
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};
