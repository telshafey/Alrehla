
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { DEFAULT_CONFIG } from './config';

// استخدام القيم من ملف التكوين المركزي
// ملاحظة: نستخدم anonKey للعمليات العادية من طرف العميل
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
 * إنشاء عميل بصلاحيات Service Role (للإدارة فقط)
 * تحذير: هذا يمنح صلاحيات كاملة لتجاوز قواعد الأمان (RLS).
 * يجب استخدامه بحذر شديد وفقط في العمليات الإدارية الحساسة.
 */
export const getServiceRoleClient = () => {
    return createClient<Database>(
        SUPABASE_URL,
        DEFAULT_CONFIG.supabase.serviceRoleKey, // استخدام مفتاح الخدمة
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );
};

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
