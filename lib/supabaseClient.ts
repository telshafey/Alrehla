
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Safe access to environment variables
const getEnvVar = (key: string, fallback: string): string => {
  try {
    const env = (import.meta as any).env;
    if (env && env[key]) {
      return env[key];
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is not available
  }
  return fallback;
};

// استخدام القيم المزودة كقيم افتراضية لضمان عمل التطبيق
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://mqsmgtparbdpvnbyxokh.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are missing. The app might not work correctly.');
}

// إنشاء العميل
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Helper function used in some services
export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://placeholder.supabase.co';
};
