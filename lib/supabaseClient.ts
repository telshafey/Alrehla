

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Using placeholder credentials to allow the application to start in mock data mode.
// These are not used for actual data fetching, which is handled by mockData.ts.
const SUPABASE_URL = 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU1NTI0NjAsImV4cCI6MjAwMTEyODY2MH0.placeholder_signature';


export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock functions for local development without Supabase
export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('supabaseUrl', url);
  localStorage.setItem('supabaseKey', key);
};

export const hasSupabaseCredentials = () => {
  return localStorage.getItem('supabaseUrl') && localStorage.getItem('supabaseKey');
};