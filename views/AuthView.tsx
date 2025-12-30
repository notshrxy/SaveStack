import React, { useState, useEffect, useCallback } from 'react';
import NeoCard from '../components/ui/NeoCard';
import NeoButton from '../components/ui/NeoButton';
import ProfileCard from '../components/Profile_Card';
import SupabaseGuide from './components/SupabaseGuide';
import { User, Zap, Loader2, LogOut, AlertTriangle, Database, ShieldAlert, RefreshCw, UserMinus, Cpu, Layers, Sparkles, X } from 'lucide-react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthViewProps {
  onOpenKeys?: () => void;
  hasKeys?: boolean;
  user?: any;
  itemsCount?: number;
}

const DEFAULT_AVATARS = [
  { name: 'Kingston', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Kingston' },
  { name: 'Riley', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Riley' },
  { name: 'Liam', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Liam' },
  { name: 'Jude', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Jude' },
  { name: 'Wyatt', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Wyatt' },
  { name: 'Ryker', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Ryker' },
  { name: 'Sawyer', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Sawyer' },
  { name: 'Alexandra', url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Katherine' },
];

const AuthView: React.FC<AuthViewProps> = ({ onOpenKeys, hasKeys = false, user, itemsCount = 0 }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [friendlyReminder, setFriendlyReminder] = useState<{ title: string; message: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string) => {
    setIsCheckingProfile(true);
    try {
      const data = await authService.getProfile(userId);
      
      if (data && 'error' in data && data.error === 'TABLE_MISSING') {
        setAuthError("TABLE_MISSING");
        setProfile(null);
      } else if (!data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
    } finally {
      setIsCheckingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    authService.checkDatabaseStatus().then(status => setDbConnected(status));

    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setAuthError(null);
    }
  }, [user, isConfigured, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) return;
    
    setLoading(true);
    setAuthError(null);
    setFriendlyReminder(null);

    try {
      if (mode === 'signup') {
        if (!selectedAvatar) throw new Error("Pick an avatar first!");
        await authService.signUp(email, password, { 
          username: username || email.split('@')[0], 
          avatar_url: selectedAvatar,
        });
        setFriendlyReminder({
          title: "LINK CREATED",
          message: "Account established! Use the Neural Entry to access your stash."
        });
        setMode('signin');
      } else {
        await authService.signIn(email, password);
      }
    } catch (err: any) {
      const msg = err.message || "";
      
      if (msg.toLowerCase().includes("user already registered") || msg.toLowerCase().includes("already exists")) {
        setFriendlyReminder({
          title: "USER ALREADY REGISTERED",
          message: "Neural link detected! This brain is already in our system. Try signing in instead."
        });
      } else if (msg.toLowerCase().includes("invalid login credentials")) {
        setFriendlyReminder({
          title: "INVALID LOGIN CREDENTIALS",
          message: "Access denied! Those keys don't match our records. Check your email or password."
        });
      } else {
        setAuthError(msg || "Neural link failure.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setProfile(null);
  };

  const getRankedTitle = (gender: 'male' | 'female', count: number) => {
    const rank = count > 20 ? 0 : count > 10 ? 1 : count > 5 ? 2 : count > 2 ? 3 : 4;
    const maleTitles = ["Eternal Vanguard", "Iron Colossus", "Stormblade Warden", "Grim Lionheart", "Ashen Sentinel"];
    const femaleTitles = ["Celestial Valkyrie", "Ember Queen", "Silver Huntress", "Stormbound Aegis", "Nightfall Siren"];
    return (gender === 'female' ? femaleTitles : maleTitles)[rank];
  };

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-red-500 p-12 border-[8px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] -rotate-2">
           <AlertTriangle size={80} className="text-white mx-auto mb-4 animate-bounce" strokeWidth={3} />
           <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic">LINK OFFLINE</h2>
        </div>
        <NeoCard className="max-w-xl bg-white p-8 border-4 border-black">
           <h3 className="text-2xl font-black uppercase mb-4 text-red-600">Config Sync Failure</h3>
           <p className="font-bold text-gray-700 mb-6 leading-relaxed">Supabase credentials are missing. Check services/supabaseClient.ts.</p>
           <NeoButton onClick={() => window.location.reload()} fullWidth className="!bg-black !text-white py-4 flex items-center justify-center gap-2">
             <RefreshCw size={20} className="mr-2" /> RE-SCAN CONNECTION
           </NeoButton>
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-[1400px] mx-auto space-y-12 pb-20 px-6">
      
      {/* HUD: Connection Status */}
      <div className="w-full flex justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-[10px] uppercase bg-lime-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ShieldAlert size={14} /> ENV: CONNECTED
        </div>
        <div 
          onClick={() => !dbConnected && setIsGuideOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-[10px] uppercase cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none ${dbConnected ? 'bg-cyan-400 text-black' : 'bg-red-500 text-white animate-pulse'}`}
        >
          {dbConnected ? <Database size={14} /> : <AlertTriangle size={14} />}
          {dbConnected ? 'DB: SCHEMATICS OK' : 'DB: TABLE MISSING (FIX)'}
        </div>
      </div>

      {!user ? (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
          
          {/* Friendly Reminder Pop-up */}
          <AnimatePresence>
            {friendlyReminder && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute -top-32 left-0 right-0 z-50 pointer-events-auto"
              >
                <NeoCard className="bg-yellow-200 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative rotate-1">
                  <button 
                    onClick={() => setFriendlyReminder(null)}
                    className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                  <div className="flex gap-4 items-start">
                    <div className="bg-white p-2 border-2 border-black shrink-0">
                      <Sparkles size={24} className="text-purple-600" strokeWidth={3} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black uppercase text-xs tracking-widest">{friendlyReminder.title}</h4>
                      <p className="font-bold text-[13px] leading-tight text-black/70 italic">
                        "{friendlyReminder.message}"
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setFriendlyReminder(null)}
                      className="w-full py-1.5 bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-600 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </NeoCard>
              </motion.div>
            )}
          </AnimatePresence>

          <NeoCard className="w-full relative overflow-visible bg-white p-0">
            <div className="flex border-b-4 border-black">
              <button 
                onClick={() => { setMode('signin'); setAuthError(null); setFriendlyReminder(null); }}
                className={`flex-1 py-4 font-black uppercase text-sm tracking-widest transition-all ${mode === 'signin' ? 'bg-[#B088FF] text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('signup'); setAuthError(null); setFriendlyReminder(null); }}
                className={`flex-1 py-4 font-black uppercase text-sm tracking-widest transition-all ${mode === 'signup' ? 'bg-[#A3E635] text-black' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8 space-y-6">
              {authError && (
                <div className="bg-red-50 border-4 border-red-600 p-4 flex gap-3 items-start animate-shake">
                  <AlertTriangle className="text-red-600 shrink-0" size={20} />
                  <p className="text-red-600 text-xs font-bold uppercase leading-tight">{authError}</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-2 mb-4">
                <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${mode === 'signin' ? 'bg-[#B088FF]' : 'bg-[#A3E635]'}`}>
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className={mode === 'signin' ? 'text-white' : 'text-black'} strokeWidth={3} />
                  )}
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mt-2">
                  {mode === 'signin' ? 'LOG IN' : 'GET STARTED'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="group">
                      <label className="block font-black uppercase text-xs mb-1 ml-1">Username</label>
                      <input 
                        type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Technomancer"
                        className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl px-4 py-3 font-bold text-lg outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-black uppercase text-xs mb-1 ml-1">Identity</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl px-4 py-[13px] font-bold text-base outline-none appearance-none cursor-pointer">
                          <option value="male">MALE</option>
                          <option value="female">FEMALE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-black uppercase text-xs mb-1 ml-1">Avatar</label>
                        <button type="button" onClick={() => setShowPicker(!showPicker)} className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl px-4 py-[13px] font-black text-[10px] uppercase hover:bg-white transition-colors border-dashed">
                          {selectedAvatar ? 'READY' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                    {showPicker && (
                      <div className="p-4 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-20 mt-2">
                        <div className="grid grid-cols-4 gap-3">
                          {DEFAULT_AVATARS.map((avatar) => (
                            <button key={avatar.name} type="button" onClick={() => { setSelectedAvatar(avatar.url); setShowPicker(false); }} className={`w-full aspect-square rounded-lg border-2 border-black overflow-hidden hover:scale-110 transition-transform ${selectedAvatar === avatar.url ? 'ring-4 ring-[#A3E635]' : ''}`}>
                              <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="group">
                  <label className="block font-black uppercase text-xs mb-1 ml-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="brain@savestack.com" className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl px-4 py-3 font-bold text-lg outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                </div>
                <div className="group">
                  <label className="block font-black uppercase text-xs mb-1 ml-1">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl px-4 py-3 font-bold text-lg outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                </div>
                <div className="pt-2">
                  <NeoButton type="submit" fullWidth disabled={loading} className="py-5 text-xl" variant={mode === 'signin' ? 'primary' : 'secondary'} style={mode === 'signup' ? { backgroundColor: '#A3E635', color: 'black' } : {}}>
                    {loading ? <Loader2 className="animate-spin" /> : mode === 'signin' ? "RESUME SESSION" : "UNLOCK ACCESS"}
                  </NeoButton>
                </div>
              </form>
            </div>
          </NeoCard>
        </div>
      ) : isCheckingProfile ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
           <div className="relative">
             <Loader2 className="animate-spin text-purple-600" size={64} strokeWidth={3} />
             <div className="absolute inset-0 m-auto w-4 h-4 bg-lime-400 border-2 border-black animate-ping" />
           </div>
           <p className="font-black uppercase tracking-[0.3em] text-sm animate-pulse">Establishing Identity Link...</p>
        </div>
      ) : profile ? (
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-12 animate-in fade-in zoom-in-95 duration-500">
          
          {/* LEFT COLUMN: Identity & Controls */}
          <div className="flex flex-col items-center space-y-8 shrink-0">
            <ProfileCard 
              name={profile.username || 'Neural User'}
              title={getRankedTitle(gender, itemsCount)}
              avatarUrl={profile.avatar_url || 'https://api.dicebear.com/9.x/lorelei/svg?seed=Riley'}
              behindGlowEnabled={true}
              behindGlowColor="rgba(125, 190, 255, 0.67)"
              enableTilt={true}
            />
            
            <NeoButton 
              onClick={handleSignOut} 
              variant="secondary" 
              className="px-12 py-4 !bg-red-50 !text-red-600 !border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,0.2)]"
            >
              <LogOut size={20} className="mr-3" /> ABORT SESSION
            </NeoButton>
          </div>

          {/* RIGHT COLUMN: Neural Hub / Upgrade Area */}
          <div className="flex-1 w-full max-w-xl pt-4">
            <NeoCard className="bg-white p-12 border-4 border-black shadow-[15px_15px_0px_0px_rgba(176,136,255,1)]">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="bg-black p-4 border-2 border-white shadow-[6px_6px_0px_black] shrink-0">
                      <Zap size={44} className="text-[#A3E635]" strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Neural Link</h3>
                      <p className="font-bold text-gray-400 text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" /> Status: Fully Synchronized
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 border-4 border-black border-dashed p-6">
                    <h4 className="text-3xl font-black uppercase leading-[0.9] mb-3">
                      Augment your knowledge hub with AI collections
                    </h4>
                    <p className="font-bold text-gray-500 text-sm leading-relaxed">
                      Transform your saved items into an interconnected intelligence network. 
                      Enable neural synthesis to reveal hidden patterns across your stashed data.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-100 border-2 border-black p-4 flex flex-col gap-2">
                      <Cpu size={24} className="text-purple-600" />
                      <span className="font-black text-[10px] uppercase">Neural Engine</span>
                      <p className="text-[11px] font-bold leading-tight">Automated multi-source synthesis.</p>
                    </div>
                    <div className="bg-cyan-100 border-2 border-black p-4 flex flex-col gap-2">
                      <Layers size={24} className="text-cyan-600" />
                      <span className="font-black text-[10px] uppercase">Deep Mapping</span>
                      <p className="text-[11px] font-bold leading-tight">Semantic cross-referencing active.</p>
                    </div>
                  </div>
                </div>

                <NeoButton 
                  fullWidth 
                  onClick={onOpenKeys} 
                  className="!bg-black !text-white !py-8 !text-2xl tracking-tighter font-black shadow-[10px_10px_0px_rgba(163,230,53,1)] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
                >
                  {hasKeys ? 'RECONFIGURE CORE' : 'ESTABLISH NEURAL LINK'}
                </NeoButton>
              </div>
            </NeoCard>
          </div>
        </div>
      ) : (
        /* MISSING PROFILE STATE (Strict) */
        <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
           <NeoCard className="bg-white p-12 border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="bg-red-500 p-4 border-4 border-black w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-[5px_5px_0px_black]">
                <UserMinus size={40} className="text-white" />
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Profile Required</h2>
              <p className="font-bold text-gray-500 mb-8 leading-tight">
                Authentication successful, but no identity record found in the database. 
                Run the SQL schematics or re-create your account.
              </p>
              <div className="flex flex-col gap-4">
                <NeoButton onClick={() => setIsGuideOpen(true)} className="!bg-[#A3E635] !text-black py-4">
                  CHECK SQL GUIDE
                </NeoButton>
                <NeoButton onClick={handleSignOut} variant="secondary" className="py-4">
                  LOG OUT
                </NeoButton>
              </div>
           </NeoCard>
        </div>
      )}

      <SupabaseGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default AuthView;
