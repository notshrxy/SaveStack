import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Key, ArrowRight, ShieldCheck, Lock, Activity, CheckCircle, HelpCircle, XCircle, ExternalLink, Zap, AlertTriangle, ShieldAlert, UserCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl relative"
      >
        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[20px_20px_0px_0px_rgba(176,136,255,1)] flex flex-col md:flex-row min-h-[550px] overflow-hidden">
          
          {/* Sidebar Rail */}
          <div className="md:w-60 bg-black flex flex-col shrink-0 border-r-[8px] border-black">
            <div className="p-8 bg-[#B088FF] border-b-[8px] border-black flex items-center justify-center">
              <ShieldCheck size={40} className="text-black" />
            </div>
            <div className="flex-grow py-6">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full p-6 text-left font-black uppercase text-xs tracking-[0.2em] flex items-center justify-between transition-all border-b border-white/5 ${activeTab === item.id ? 'bg-[#A3E635] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
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
            <div className="bg-[#B088FF] text-white p-6 border-b-[8px] border-black flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-black p-2 border-2 border-white">
                     <Activity size={32} className="text-[#A3E635]" strokeWidth={3} />
                  </div>
                  <h2 className="font-jersey text-5xl uppercase tracking-widest leading-none">Neural Link Required</h2>
                </div>
                <div className="bg-black text-white px-3 py-1 font-black text-xs uppercase border-2 border-white">
                  v1.1.0-SECURE
                </div>
              </div>
              <div className="mt-1">
                 <span className="bg-white text-black px-4 py-1 font-black text-[14px] uppercase border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   {vaultStatus[AIProvider.GEMINI] ? '(LINK SYNCHRONIZED)' : '(LINK NOT YET ESTABLISHED)'}
                 </span>
              </div>
            </div>

            <div className="p-10 flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === AIProvider.GEMINI ? (
                  <motion.div key="gemini" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-4">
                       <h3 className="text-5xl font-black uppercase tracking-tight leading-none text-black">
                         "WHO'S PAYING FOR THE BRAIN POWER?"
                       </h3>
                       <p className="text-xl font-bold border-l-8 border-black pl-5 text-black/60 leading-snug max-w-2xl">
                         To keep SaveStack free for everyone, you must connect your own Google AI Studio API Key. 
                         <span className="text-black block mt-2">Free Tier keys are fully supported.</span>
                       </p>
                    </div>

                    <div className="bg-white border-4 border-black p-6 flex flex-col gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                       <div className="flex items-center gap-4">
                          <div className="bg-cyan-400 p-3 border-2 border-black shrink-0">
                             <Key size={24} className="text-black" />
                          </div>
                          <h4 className="font-black uppercase text-sm">ENTER YOUR API KEY</h4>
                       </div>
                       <input 
                          type="password"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          placeholder="Paste your Gemini API key here..."
                          className="w-full bg-[#FAF5E9] border-4 border-black p-4 font-bold text-lg outline-none focus:bg-white transition-all"
                       />
                       <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                         Your key is stored in your private vault and only used for your requests.
                       </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 pt-4">
                       <NeoButton 
                        fullWidth 
                        size="lg" 
                        onClick={handleConnectGemini} 
                        disabled={isConnecting || !geminiKey}
                        className="!bg-[#A3E635] !text-black text-2xl py-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex-grow"
                       >
                         {isConnecting ? <Loader2 size={32} className="animate-spin" /> : <>CONNECT YOUR GEMINI <ArrowRight size={28} className="ml-3" strokeWidth={3} /></>}
                       </NeoButton>
                       <NeoButton 
                        variant="secondary" 
                        onClick={onSkip} 
                        className="!bg-gray-300 !text-black px-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                       >
                         LATER
                       </NeoButton>
                    </div>
                  </motion.div>
                ) : !isLoggedIn ? (
                  <motion.div key="logged-out" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                     <div className="bg-red-500 p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <UserCheck size={64} className="text-white mx-auto mb-4" strokeWidth={3} />
                        <h3 className="text-4xl font-black uppercase text-white tracking-tighter">Identity Required</h3>
                     </div>
                     <p className="max-w-md font-bold text-xl leading-snug text-black/60">
                        We can't store cloud secrets for a ghost. You need to sign in to SaveStack to enable fallback vaulting.
                     </p>
                     <NeoButton size="lg" onClick={onGoToAuth} className="px-12 !bg-black !text-white text-2xl py-6 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]">
                        LOG IN TO LINK
                     </NeoButton>
                  </motion.div>
                ) : (
                  <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="bg-black text-[#A3E635] p-8 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-3">
                           <Lock size={32} />
                           <h3 className="text-3xl font-black uppercase">PROVIDER VAULT</h3>
                        </div>
                        <p className="font-bold text-sm uppercase text-white/70 leading-tight">
                          Plug in your {activeTab.toUpperCase()} key — we’ll handle the rest.
                          <br/>
                          One key. Fewer failures. Smarter routing.
                        </p>
                     </div>

                     <div className="space-y-4">
                        <label className="block font-black uppercase text-xs tracking-widest text-black/50">Provider Secret Key</label>
                        <div className="relative group">
                           <input 
                              type="password"
                              value={tempKey}
                              onChange={(e) => setTempKey(e.target.value)}
                              placeholder={`sk-....`}
                              className="w-full bg-white border-4 border-black p-6 font-black uppercase text-xl focus:outline-none focus:bg-yellow-50 transition-all"
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