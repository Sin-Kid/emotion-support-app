import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Graceful fallback to prevent white screen crashes if environment variables are not yet loaded/configured
let client;
if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    client = createClient("https://placeholder-project-url.supabase.co", "placeholder-anon-key");
  }
} else {
  console.warn("Supabase credentials missing! Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Netlify settings.");
  client = createClient("https://placeholder-project-url.supabase.co", "placeholder-anon-key");
}

export const supabase = client;
