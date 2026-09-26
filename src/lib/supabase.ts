import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase credentials not found in environment variables. Application is running in offline/mock mode or will fail API requests.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
