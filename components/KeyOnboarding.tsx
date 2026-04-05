import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Key, ArrowRight, ShieldCheck, Lock, Activity, CheckCircle, HelpCircle, XCircle, ExternalLink, Zap, AlertTriangle, ShieldAlert, UserCheck, X } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import { AIProvider } from '../types';
import { vaultService } from '../services/vaultService';

interface KeyOnboardingProps {
  isLoggedIn: boolean;
  onGoToAuth: () => void;
  onSuccess: () => void;
  onSkip: () => void;
  onDisableAI: () => void;
  isReopened?: boolean;
}

const KeyOnboarding: React.FC<KeyOnboardingProps> = ({ isLoggedIn, onGoToAuth, onSuccess, onSkip, onDisableAI, isReopened = false }) => {
  const [activeTab, setActiveTab] = useState<AIProvider>(AIProvider.GEMINI);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [vaultStatus, setVaultStatus] = useState<Record<string, boolean>>({});
  const [showWarning, setShowWarning] = useState(false);

  // Sync vault status on mount
  useEffect(() => {
    const checkVault = async () => {
      const statuses: Record<string, boolean> = {};
      for (const p of Object.values(AIProvider)) {
        const key = await vaultService.getKey(p);
        statuses[p] = !!key;
      }
      setVaultStatus(statuses);
    };
    if (isLoggedIn) checkVault();
  }, [isLoggedIn]);

  const sidebarItems = [
    { id: AIProvider.GEMINI, label: 'GEMINI', status: vaultStatus[AIProvider.GEMINI], restricted: false },
    { id: AIProvider.OPENAI, label: 'OPENAI', status: vaultStatus[AIProvider.OPENAI], restricted: !isLoggedIn },
    { id: AIProvider.PERPLEXITY, label: 'PERPLEXITY', status: vaultStatus[AIProvider.PERPLEXITY], restricted: !isLoggedIn },
    { id: AIProvider.OTHERS, label: 'OTHERS', status: vaultStatus[AIProvider.OTHERS], restricted: !isLoggedIn },
  ];

  const handleConnectGemini = async () => {
    if (!geminiKey) return;
    setIsConnecting(true);

    try {
      // 1. EAGER SAVE: Add to DB immediately
      console.log("Vaulting Gemini Key...");
      await vaultService.saveKey(AIProvider.GEMINI, geminiKey);

      // Update local UI state optimistically
      setVaultStatus(prev => ({ ...prev, [AIProvider.GEMINI]: true }));

      // 2. BACKGROUND VALIDATION: Ping the API
      console.log("Validating Key via Ping...");
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      try {
        await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'ping',
          config: { maxOutputTokens: 1 }
        });
        console.log("Gemini Key Validated.");
      } catch (validationError) {
        console.warn("Key saved but validation failed. Key might be Free Tier or restricted:", validationError);
        // We don't block the flow here, but we warn the user
        alert("Key saved to Vault, but validation ping failed. You might have hit rate limits or entered an invalid key format. Check your AI Studio settings.");
      }

      // 3. COMPLETE: Fire success callback
      onSuccess();
    } catch (error: any) {
      console.error("Critical Connection Error:", error);
      alert(`Connection Failed: ${error.message || 'Unknown database error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveVaultKey = async () => {
    if (!tempKey) return;
    setIsConnecting(true);
    try {
      await vaultService.saveKey(activeTab, tempKey);
      setVaultStatus(prev => ({ ...prev, [activeTab]: true }));
      setTempKey('');
      alert(`${activeTab.toUpperCase()} linked to SaveStack Vault.`);
      if (activeTab === AIProvider.GEMINI) onSuccess();
    } catch (error) {
      alert("Failed to save to vault. Check Supabase connection.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-3xl relative my-8"
      >
        {/* Close Button - Outside the box */}
        <button
          onClick={onSkip}
          className="absolute -top-6 -right-6 z-[100] bg-red-500 p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
          title="Close"
        >
          <X size={20} className="text-white group-hover:rotate-90 transition-transform" strokeWidth={4} />
        </button>

        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[12px_12px_0px_0px_rgba(176,136,255,1)] flex flex-col md:flex-row overflow-hidden max-h-[85vh]">

          {/* Sidebar Rail */}
          <div className="md:w-44 bg-black flex flex-col shrink-0 border-r-[8px] border-black overflow-y-auto">
            <div className="p-4 bg-[#B088FF] border-b-[8px] border-black flex items-center justify-center">
              <ShieldCheck size={28} className="text-black" />
            </div>
            <div className="flex-grow py-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full p-4 text-left font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-between transition-all border-b border-white/5 ${activeTab === item.id ? 'bg-[#A3E635] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className="flex items-center gap-3">
                    {item.restricted ? (
                      <Lock size={12} className="text-white/30" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-[#A3E635] animate-pulse' : 'bg-red-500'}`} />
                    )}
                    {item.label}
                  </span>
                  {activeTab === item.id && <ArrowRight size={14} />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t-[4px] border-white/10">
              <button
                onClick={() => setShowWarning(true)}
                className="w-full py-3 bg-red-600/20 text-red-500 font-black uppercase text-[10px] border-2 border-red-500/50 hover:bg-red-600 hover:text-white transition-all"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>

          {/* Main Interface */}
          <div className="flex-grow flex flex-col bg-[#FAF5E9]">
            <div className="bg-[#B088FF] text-white p-3 border-b-[8px] border-black flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-black p-1 border-2 border-white">
                    <Activity size={20} className="text-[#A3E635]" strokeWidth={3} />
                  </div>
                  <h2 className="font-jersey text-3xl uppercase tracking-widest leading-none">Neural Link Required</h2>
                </div>
                <div className="bg-black text-white px-2 py-0.5 font-black text-[9px] uppercase border-2 border-white">
                  v1.1.0-SECURE
                </div>
              </div>
              <div className="mt-1">
                <span className="bg-white text-black px-4 py-1 font-black text-[14px] uppercase border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {vaultStatus[AIProvider.GEMINI] ? '(LINK SYNCHRONIZED)' : '(LINK NOT YET ESTABLISHED)'}
                </span>
              </div>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === AIProvider.GEMINI ? (
                  <motion.div key="gemini" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none text-black">
                        "WHO'S PAYING FOR THE BRAIN POWER?"
                      </h3>
                      <p className="text-base font-bold border-l-4 border-black pl-3 text-black/60 leading-snug max-w-2xl">
                        To keep SaveStack free for everyone, you must connect your own Google AI Studio API Key.
                        <span className="text-black block mt-1">Free Tier keys are fully supported.</span>
                      </p>
                    </div>

                    <div className="bg-white border-4 border-black p-3 flex flex-col gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2">
                        <div className="bg-cyan-400 p-1.5 border-2 border-black shrink-0">
                          <Key size={16} className="text-black" />
                        </div>
                        <h4 className="font-black uppercase text-[10px]">ENTER YOUR API KEY</h4>
                      </div>
                      <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="Paste your Gemini API key here..."
                        className="w-full bg-[#FAF5E9] border-2 border-black p-2 font-bold text-sm outline-none focus:bg-white transition-all"
                      />
                      <p className="text-[8px] font-bold text-gray-500 uppercase leading-tight">
                        Your key is stored in your private vault and only used for your requests.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <NeoButton
                        fullWidth
                        size="lg"
                        onClick={handleConnectGemini}
                        disabled={isConnecting || !geminiKey}
                        className="!bg-[#A3E635] !text-black text-lg py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow"
                      >
                        {isConnecting ? <Loader2 size={20} className="animate-spin" /> : <>CONNECT YOUR GEMINI <ArrowRight size={20} className="ml-2" strokeWidth={3} /></>}
                      </NeoButton>
                      <NeoButton
                        variant="secondary"
                        onClick={onSkip}
                        className="!bg-gray-300 !text-black px-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        LATER
                      </NeoButton>
                    </div>
                  </motion.div>
                ) : !isLoggedIn ? (
                  <motion.div key="logged-out" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="bg-red-500 p-6 border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <UserCheck size={48} className="text-white mx-auto mb-2" strokeWidth={3} />
                      <h3 className="text-3xl font-black uppercase text-white tracking-tighter">Identity Required</h3>
                    </div>
                    <p className="max-w-md font-bold text-lg leading-snug text-black/60">
                      We can't store cloud secrets for a ghost. You need to sign in to SaveStack to enable fallback vaulting.
                    </p>
                    <NeoButton size="lg" onClick={onGoToAuth} className="px-10 !bg-black !text-white text-xl py-4 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]">
                      LOG IN TO LINK
                    </NeoButton>
                  </motion.div>
                ) : (
                  <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="bg-black text-[#A3E635] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock size={24} />
                        <h3 className="text-2xl font-black uppercase">PROVIDER VAULT</h3>
                      </div>
                      <p className="font-bold text-xs uppercase text-white/70 leading-tight">
                        Plug in your {activeTab.toUpperCase()} key — we’ll handle the rest.
                        <br />
                        One key. Fewer failures. Smarter routing.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-black uppercase text-[10px] tracking-widest text-black/50">Provider Secret Key</label>
                      <div className="relative group">
                        <input
                          type="password"
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          placeholder={`sk-....`}
                          className="w-full bg-white border-4 border-black p-4 font-black uppercase text-lg focus:outline-none focus:bg-yellow-50 transition-all"
                        />
                      </div>

                      <NeoButton fullWidth size="lg" onClick={handleSaveVaultKey} disabled={isConnecting}>
                        {isConnecting ? <Loader2 className="animate-spin" /> : <>SECURE IN HUB VAULT</>}
                      </NeoButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </NeoCard>

        {/* Warning Confirmation Modal */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[700] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
            >
              <NeoCard className="bg-white max-w-md w-full p-8 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="bg-red-500 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldAlert size={48} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">WAIT A SECOND!</h3>
                    <p className="font-bold text-gray-600 leading-tight">
                      Proceeding will entirely turn off all AI Related features like summarization, brain mapping, and audioOS.
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-4">
                    <NeoButton
                      variant="danger"
                      onClick={onDisableAI}
                      className="text-lg py-4"
                    >
                      PROCEED
                    </NeoButton>
                    <button
                      onClick={() => setShowWarning(false)}
                      className="font-black uppercase text-xs tracking-widest hover:underline"
                    >
                      Wait, take me back
                    </button>
                  </div>
                </div>
              </NeoCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default KeyOnboarding;
