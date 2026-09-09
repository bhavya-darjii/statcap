/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.\n' +
    'Make sure these are configured in your environment variables (.env / Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
