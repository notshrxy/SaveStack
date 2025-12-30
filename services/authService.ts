import { supabase, isSupabaseConfigured } from './supabaseClient';

const ensureConfigured = () => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please check your credentials.");
  }
};

export const authService = {
  async signUp(email: string, password: string, profileData: { username: string, avatar_url: string | null }) {
    ensureConfigured();
    
    // 1. Create the Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: profileData.username,
          avatar_url: profileData.avatar_url
        }
      }
    });

    if (authError) throw authError;

    // 2. Direct Profile Injection (Manual Insert)
    // We do this here to ensure the row exists even if the server-side trigger fails.
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: profileData.username,
          email: email,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error("Manual profile insertion failed:", profileError.message);
        // Note: We don't throw here because the Auth account was still created.
        // The user might need to fix their RLS policies.
      }
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    ensureConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string) {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        if (error.code === '42P01') return { error: 'TABLE_MISSING' };
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },

  async checkDatabaseStatus() {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error || error.code !== '42P01';
    } catch {
      return false;
    }
  }
};