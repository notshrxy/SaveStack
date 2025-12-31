import React from 'react';
import { motion } from 'framer-motion';
import { X, Database, Code, AlertTriangle, ShieldCheck } from 'lucide-react';
import NeoCard from '../components/ui/NeoCard';
import NeoButton from '../components/ui/NeoButton';

interface SupabaseGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupabaseGuide: React.FC<SupabaseGuideProps> = ({ isOpen, onClose }) => {
  const authSchema = `-- 1. RESET & WIPE PROFILE POLICIES
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- RE-ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ESTABLISH CLEAN POLICIES
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (auth.uid() = id);`;

  const vaultSchema = `-- 1. CREATE NEURAL VAULT TABLE
CREATE TABLE IF NOT EXISTS ai_secrets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider) -- Critical for 'upsert' logic
);

-- 2. ENABLE SECURITY
ALTER TABLE ai_secrets ENABLE ROW LEVEL SECURITY;

-- 3. ISOLATION POLICIES (Users only see their own keys)
CREATE POLICY "vault_manage_policy" ON ai_secrets
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl min-h-screen md:min-h-0"
      >
        <NeoCard className="bg-yellow-400 p-0 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,1)]">
          <div className="bg-black text-white p-6 flex justify-between items-center border-b-[8px] border-black">
            <div className="flex items-center gap-4">
              <Database size={32} className="text-yellow-400" />
              <h2 className="font-jersey text-4xl uppercase tracking-widest">Supabase Schematics</h2>
            </div>
            <button onClick={onClose} className="bg-red-500 p-2 border-4 border-white hover:rotate-90 transition-transform">
              <X size={24} strokeWidth={4} />
            </button>
          </div>

          <div className="p-8 space-y-10 bg-[#FAF5E9]">
            <div className="bg-red-600 border-4 border-black p-6 text-white shadow-[8px_8px_0px_black] rotate-[-1deg]">
                <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={24} />
                    <h4 className="font-black uppercase text-xl">Table Setup Required</h4>
                </div>
                <p className="font-bold text-sm leading-tight">
                    Your database is missing the **ai_secrets** table. Without it, your API keys cannot be saved to the vault.
                </p>
            </div>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#B088FF] p-2 border-4 border-black shadow-[4px_4px_0px_black]">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase">Step 1: The Neural Vault</h3>
              </div>
              <p className="font-bold text-gray-500 text-sm italic">Run this first to enable API key storage:</p>
              <pre className="bg-black text-lime-400 p-6 border-4 border-black overflow-x-auto font-mono text-xs leading-relaxed shadow-[8px_8px_0px_black]">
                {vaultSchema}
              </pre>
            </section>

            <section className="space-y-4 pt-4 border-t-4 border-black/10">
              <div className="flex items-center gap-3">
                <div className="bg-lime-500 p-2 border-4 border-black shadow-[4px_4px_0px_black]">
                  <Code size={24} className="text-black" />
                </div>
                <h3 className="text-3xl font-black uppercase">Step 2: Profiles & Auth</h3>
              </div>
              <p className="font-bold text-gray-500 text-sm italic">Fixes "Identity Required" errors:</p>
              <pre className="bg-black text-blue-300 p-6 border-4 border-black overflow-x-auto font-mono text-xs leading-relaxed shadow-[8px_8px_0px_black]">
                {authSchema}
              </pre>
            </section>
          </div>

          <div className="bg-black p-6 flex justify-end">
            <NeoButton variant="secondary" onClick={onClose} className="bg-white text-black px-12">
              Back to App
            </NeoButton>
          </div>
        </NeoCard>
      </motion.div>
    </div>
  );
};

export default SupabaseGuide;
