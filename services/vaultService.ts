import { supabase } from './supabaseClient';
import { AIProvider } from '../types';

export const vaultService = {
  /**
   * Saves a provider key to the Supabase Vault (ai_secrets table).
   */
  async saveKey(provider: AIProvider, key: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required to access Vault.");

    const { error } = await supabase
      .from('ai_secrets')
      .upsert({
        user_id: user.id,
        provider: provider,
        encrypted_key: key,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' });

    if (error) {
      console.error("Vault Save Error:", error.message);
      throw error;
    }
    
    // Set fast-path cache
    if (provider === AIProvider.GEMINI) {
      localStorage.setItem('SAVESTACK_HAS_GEMINI_KEY', 'true');
    }
    
    return true;
  },

  /**
   * Retrieves a key for the current authenticated user.
   * Optimized to prevent hanging during app initialization.
   */
  async getKey(provider: AIProvider): Promise<string | null> {
    try {
      // 1. Timeout wrapper for the session check
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      if (!session) return null;

      const { data, error } = await supabase
        .from('ai_secrets')
        .select('encrypted_key')
        .eq('user_id', session.user.id)
        .eq('provider', provider)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') console.warn("Vault Table 'ai_secrets' missing.");
        return null;
      }
      
      const key = data?.encrypted_key || null;
      if (key && provider === AIProvider.GEMINI) {
        localStorage.setItem('SAVESTACK_HAS_GEMINI_KEY', 'true');
      }
      return key;
    } catch (err) {
      return null;
    }
  }
};
