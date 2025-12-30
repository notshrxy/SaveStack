import React, { useState, useEffect, useRef } from 'react';
import NeoButton from '../components/ui/NeoButton';
import NeoCard from '../components/ui/NeoCard';
import SearchBar from '../components/SearchBar';
import Dock from '../components/ui/Dock';
import { Brain, Zap, CheckCircle2, ArrowRight, BrainCircuit, FileText, Timer, Headphones, Network, MessageCircle, ZapOff } from 'lucide-react';
import { ViewState, RecentActivityEntry, CATEGORY_COLORS, Category } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeViewProps {
  onChangeView: (view: ViewState) => void;
  onOpenAddModal: () => void;
  onOpenSummaryPanel: () => void;
  onOpenHelpChat: () => void;
  onOpenQuiz: () => void;
  onOpenTimer: () => void;
  onOpenEarWorm: () => void;
  onOpenStashCastGuide: () => void;
  onOpenAntiHoardGuide: () => void;
  onOpenSemanticWebGuide: () => void;
  onOpenBrainWeb: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  history: RecentActivityEntry[];
  onCategorySelect: (cat: Category) => void;
  isAIEnabled?: boolean;
  isAIOffline?: boolean;
  onTriggerReEnableAI?: () => void;
}

const TypewriterText: React.FC<{ text: string; interval: number }> = ({ text, interval }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setDisplayedText('');
      setIndex(0);
    }, interval);
    return () => clearInterval(refreshTimer);
  }, [interval]);

  return (
    <span className="relative">
      {displayedText}
      <span className="inline-block w-[3px] h-[1.1em] bg-black ml-1 align-middle animate-pulse"></span>
    </span>
  );
};

const SurpriseLabel: React.FC<{ mousePos: { x: number; y: number } | null }> = ({ mousePos }) => {
  if (!mousePos) return null;
  
  return (
    <motion.div 
      className="fixed pointer-events-none z-[100] bg-blue-500 border-4 border-black px-4 py-1 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12"
      style={{ 
        left: mousePos.x, 
        top: mousePos.y,
        translateX: '-50%',
        translateY: '-150%' 
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      SURPRISE
    </motion.div>
  );
};

const HomeView: React.FC<HomeViewProps> = ({ 
  onChangeView, 
  onOpenAddModal, 
  onOpenSummaryPanel,
  onOpenHelpChat,
  onOpenQuiz,
  onOpenTimer,
  onOpenEarWorm,
  onOpenStashCastGuide,
  onOpenAntiHoardGuide,
  onOpenSemanticWebGuide,
  onOpenBrainWeb,
  searchQuery, 
  setSearchQuery,
  history,
  onCategorySelect,
  isAIEnabled = true,
  isAIOffline = true,
  onTriggerReEnableAI
}) => {
  const [isAudioHovered, setIsAudioHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aiInactive = !isAIEnabled || isAIOffline;

  useEffect(() => {
    if (isAudioHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isAudioHovered]);

  const handleSearchTrigger = () => {
    if (searchQuery.trim().length > 0) {
      onChangeView('PROJECTS');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const fullDescription = "From saved chaos to usable knowledge — a smarter home for what you save but never revisit.";

  const dockItems = [
    {
      icon: <Network size={18} className="text-white" />,
      label: "Brain Web",
      onClick: onOpenBrainWeb,
      className: !aiInactive ? "bg-red-600" : "bg-gray-400 grayscale"
    },
    {
      icon: <Headphones size={18} className="text-white" />,
      label: "StashCast",
      onClick: onOpenEarWorm,
      className: !aiInactive ? "bg-orange-500" : "bg-gray-400 grayscale"
    },
    {
      icon: <BrainCircuit size={18} className="text-white" />,
      label: "Quiz Blast",
      onClick: onOpenQuiz,
      className: !aiInactive ? "bg-yellow-500" : "bg-gray-400 grayscale"
    },
    {
      icon: <FileText size={18} className="text-white" />,
      label: "Summarize",
      onClick: onOpenSummaryPanel,
      className: !aiInactive ? "bg-blue-500" : "bg-gray-400 grayscale"
    },
    {
      icon: <Timer size={18} className="text-white" />,
      label: "Focus Flow",
      onClick: onOpenTimer,
      className: "bg-purple-500"
    },
    {
      icon: <MessageCircle size={18} className="text-white" />,
      label: "AI Support",
      onClick: onOpenHelpChat,
      className: !aiInactive ? "bg-lime-500" : "bg-gray-400 grayscale"
    }
  ];

  return (
    <div className="space-y-12 pb-12 relative overflow-visible">
      <SurpriseLabel mousePos={mousePos} />

      <div className="fixed top-1/4 right-[-5%] w-96 h-96 bg-lime-400/20 rounded-full border-[10px] border-black/5 -z-10 animate-spin-slow"></div>

      <section className="relative">
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          <div className="flex flex-col z-10 relative">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tight">
                Save it.<br/>
                <span className="text-white bg-black px-4 box-decoration-clone">Sort it.</span><br/>
                <span className="inline-block mt-4">
                  <span className="relative inline-block mr-[0.3em]">
                    Actually
                    <span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-blue-500"></span>
                  </span>
                  <span className="relative inline-block">
                    use it.
                    <span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-blue-500"></span>
                  </span>
                </span>
              </h1>
              <p 
                className="text-2xl border-l-[6px] border-black pl-6 max-w-lg leading-relaxed min-h-[4em]"
                style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}
              >
                <TypewriterText text={fullDescription} interval={15000} />
              </p>

              <div className="pt-4 max-w-xl group">
                <label className="block font-black uppercase text-xs mb-2 ml-1">Quick Search your brain</label>
                <div onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}>
                  <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-6 pt-12 items-center sm:items-start overflow-visible">
              <NeoButton size="lg" onClick={onOpenAddModal} className="text-xl px-10 py-6">Add Content</NeoButton>
              <div className="relative inline-flex flex-col sm:flex-row items-center gap-6 overflow-visible">
                <NeoButton size="lg" variant="secondary" onClick={() => onChangeView('PROJECTS')} className="text-xl px-10 py-6">
                  View Stash
                </NeoButton>
                
                <div className="absolute left-[85%] top-full sm:top-1/2 -translate-y-1/2 ml-4 z-20 flex items-center animate-float pointer-events-none">
                  <svg width="45" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-[-20deg] -translate-x-2">
                      <path d="M5 22C25 18 45 32 68 18L75 13M68 18L65 25" stroke="black" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="bg-pink-400 border-2 border-black px-4 py-2 font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3 whitespace-nowrap">
                    My Collections
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-20 md:mt-0 flex flex-col h-full overflow-visible pt-16 md:pt-20">
             <div className="flex flex-col h-full justify-between overflow-visible">
                <div className="relative overflow-visible z-10">
                  <div className="absolute -top-16 -left-20 z-20 flex flex-col items-center rotate-[-8deg] animate-float hidden lg:flex pointer-events-none">
                    <span className="bg-yellow-400 border-4 border-black px-6 py-3 font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                      What were you up to?
                    </span>
                    <svg width="50" height="45" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2 transform rotate-[40deg] translate-x-16">
                        <path d="M5 22C25 18 45 32 68 18L75 13M68 18L65 25" stroke="black" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="absolute -top-8 -right-12 w-[180px] h-[180px] bg-green-400 rounded-full border-4 border-black z-0 animate-wiggle pointer-events-none shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"></div>

                  <div className="absolute -bottom-12 -left-16 w-[180px] h-[180px] bg-red-400 border-4 border-black z-0 animate-rotate-path pointer-events-none shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"></div>

                  <NeoCard className="relative transform rotate-2 hover:rotate-0 transition-transform bg-cyan-200 p-8 min-h-[380px] z-10">
                      <div className="flex items-center gap-6 mb-6 border-b-4 border-black pb-6">
                          <Brain size={64} className="text-black" />
                          <div>
                              <h3 className="text-3xl font-black uppercase">Recent Activity</h3>
                              <p className="font-bold text-lg">Your latest brain steps</p>
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          {history.length > 0 ? (
                            history.map((entry, idx) => {
                              const isItem = entry.type === 'ITEM';
                              const title = isItem ? entry.data.title : entry.data;
                              const category = isItem ? entry.data.category : entry.data;
                              const colorClass = CATEGORY_COLORS[category] || 'bg-yellow-300';
                              
                              return (
                                <div 
                                  key={isItem ? entry.data.id : `cat-${entry.data}-${idx}`}
                                  onClick={() => isItem ? onChangeView('PROJECTS') : onCategorySelect(entry.data as Category)}
                                  className="bg-white border-4 border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group"
                                >
                                  <div className="flex flex-col">
                                    <span className={`font-black text-[10px] uppercase mb-1 ${isItem ? 'text-blue-600' : 'text-purple-600'}`}>
                                      {isItem ? 'STASHED' : 'EXPLORED'}
                                    </span>
                                    <span className="font-black text-sm uppercase leading-tight group-hover:underline truncate max-w-[180px]">{title}</span>
                                  </div>
                                  <span className={`text-[8px] font-black px-2 py-1 border-2 border-black uppercase whitespace-nowrap ml-4 ${colorClass}`}>
                                    {category}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                              <Zap size={48} className="mb-4" />
                              <p className="font-black uppercase text-xl">Empty Mind</p>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => onChangeView('PROJECTS')}
                            className="w-full py-2 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-black/5 transition-colors border-t-2 border-black/10 mt-2"
                          >
                            Explore full stash <ArrowRight size={14} />
                          </button>
                      </div>
                  </NeoCard>
                </div>

                <div className="mt-12 hidden lg:flex justify-end overflow-visible relative z-20">
                   <Dock 
                    items={dockItems} 
                    magnification={70} 
                    panelHeight={72} 
                    baseItemSize={48} 
                    className="bg-white"
                   />
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 relative z-10">
        <NeoCard 
          color="bg-orange-300" 
          className="p-10 group hover:rotate-1 transition-transform relative overflow-hidden"
          onClick={onOpenSemanticWebGuide}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
              <div className="bg-white w-16 h-16 border-4 border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <Network size={32} />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4">Semantic Web</h3>
              <p className="text-lg font-bold leading-tight uppercase">We don't just store links. Gemini maps how your ideas relate across subjects.</p>
        </NeoCard>
        
        <NeoCard 
          color="bg-pink-300" 
          className="p-10 relative overflow-hidden group hover:rotate-[-1deg] transition-transform"
          onMouseEnter={() => { setIsAudioHovered(true); }}
          onMouseLeave={() => { setIsAudioHovered(false); }}
          onMouseMove={handleMouseMove}
          onClick={onOpenStashCastGuide}
        >
              <div className={`absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none ${isAudioHovered ? 'opacity-40' : 'opacity-0'}`}>
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                >
                  <source src="" type="video/mp4" />
                </video>
              </div>

              <div className="relative z-10">
                <div className="bg-white w-16 h-16 border-4 border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110">
                    <Headphones size={32} />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4">Audio OS</h3>
                <p className="text-lg font-bold leading-tight uppercase">Get summaries voiced by your AI study buddy while you commute or chill.</p>
              </div>
        </NeoCard>

        <NeoCard 
          color="bg-lime-300" 
          className="p-10 group hover:rotate-1 transition-transform relative overflow-hidden"
          onClick={onOpenAntiHoardGuide}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
              <div className="bg-white w-16 h-16 border-4 border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={32} />
              </div>
              <h3 className="text-3xl font-black uppercase mb-4">Anti-Hoard</h3>
              <p className="text-lg font-bold leading-tight uppercase">Interaction streaks keep your stash alive. Don't let your knowledge decay.</p>
        </NeoCard>
      </section>

      {aiInactive && (
        <NeoCard className="bg-red-50 border-8 border-dashed border-red-200 p-8 text-center flex flex-col items-center gap-4">
          <ZapOff size={48} className="text-red-400" />
          <h4 className="text-3xl font-black uppercase">AI Engine is Parked</h4>
          <p className="font-bold text-red-700 max-w-lg">You decided to miss out on AI features for now. All neural processing is currently suspended.</p>
          <NeoButton onClick={onTriggerReEnableAI} size="sm" className="!bg-black !text-white mt-2">
            RE-ENGAGE NEURAL LINK
          </NeoButton>
        </NeoCard>
      )}

      <div className="lg:hidden flex justify-center w-full overflow-visible py-8">
         <Dock items={dockItems} magnification={65} baseItemSize={44} panelHeight={64} />
      </div>
    </div>
  );
};

export default HomeView;