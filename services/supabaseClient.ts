import { createClient } from '@supabase/supabase-js';

// Hardcoded for project: bxvkrigyblidxhfzkliv
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL!;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY!;

/**
 * Diagnostic helper to verify if the configuration is valid.
 */
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 50;
};

// Initializing the client with the user's provided keys.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log verification
console.log("🚀 Supabase Client: Direct Link Established to DB");
