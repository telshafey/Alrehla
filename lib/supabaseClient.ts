
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// بيانات مشروع Supabase الحقيقية
const SUPABASE_URL = 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('تنبيه: بيانات الاتصال بـ Supabase مفقودة.');
}

// إنشاء العميل
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Helper function used in some services
export const hasSupabaseCredentials = () => {
  return true;
};
