// v3
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const SUPABASE_URL = 'https://mqsmgtparbdpvnbyxokh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ul6GGt6kKAa6wapZNTLQnA_go19Zi1A';

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
