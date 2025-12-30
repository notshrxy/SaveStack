
// DO NOT add any new files, classes, or namespaces.
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentItem, CATEGORY_COLORS, Category } from '../types';
import NeoCard from '../components/ui/NeoCard';
import NeoButton from '../components/ui/NeoButton';
import { 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Trash2, 
  Share2, 
  AlertTriangle, 
  AlertCircle, 
  Headphones, 
  Flame, 
  RefreshCcw, 
  Ghost, 
  CheckCircle, 
  RotateCcw,
  Info,
  ZapOff
} from 'lucide-react';
import EarWorm from '../components/EarWorm';

interface ProjectsViewProps {
  items: ContentItem[];
  onToggleCheck: (id: string) => void;
  onMarkAllChecked: (ids: string[], isChecked?: boolean) => void;
  onDeleteItem: (id: string) => void;
  onReorder: (newOrder: ContentItem[]) => void;
  onInteract: (id: string) => void;
  initialFilter?: Category | 'ALL';
  isAIEnabled?: boolean;
  // Fix: Added isAIOffline property to props to resolve the assignment error in App.tsx.
  isAIOffline?: boolean;
  // DO handle the Promise return type for onAIRevive from App.tsx.
  onAIRevive?: () => Promise<boolean>; // Returns true if allowed
}

type FilterType = 'ALL' | 'CHECKED' | 'UNCHECKED' | 'STALE' | Category;

const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  items, 
  onToggleCheck,
  onMarkAllChecked,
  onDeleteItem,
  onReorder,
  onInteract,
  initialFilter = 'ALL',
  isAIEnabled = true,
  // Fix: added isAIOffline to destructuring with a default value.
  isAIOffline = false,
  onAIRevive
}) => {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [activeAudioItem, setActiveAudioItem] = useState<ContentItem | null>(null);
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);

  React.useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filter === 'CHECKED') result = items.filter(i => i.isChecked);
    else if (filter === 'UNCHECKED') result = items.filter(i => !i.isChecked);
    else if (filter === 'STALE') result = items.filter(i => (Date.now() - i.lastInteracted) > 7 * 24 * 60 * 60 * 1000);
    else if (filter !== 'ALL') result = items.filter(i => i.category === filter);
    return result.sort((a, b) => b.dateAdded - a.dateAdded);
  }, [items, filter]);

  const handleShare = (e: React.MouseEvent, item: ContentItem) => {
    e.stopPropagation();
    onInteract(item.id);
    const shareUrl = item.url !== '#' ? item.url : window.location.href;
    const shareText = `Check out this ${item.category} resource: ${item.title}. Summarized via SaveStack!`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: shareText, url: shareUrl });
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  const getDecayLevel = (lastInteracted: number) => {
    const hoursSince = (Date.now() - lastInteracted) / (1000 * 60 * 60);
    const daysSince = hoursSince / 24;
    
    if (hoursSince < 24) return 0; // Hot Streak
    if (daysSince < 3) return 1;   // Fresh
    if (daysSince < 7) return 2;   // Cooling
    if (daysSince < 14) return 3;  // Stale (Streak Strike Warning)
    return 4;                      // Critical Decay
  };

  const getDecayStyles = (level: number) => {
    switch (level) {
      case 0: return "border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)] scale-[1.02] z-20";
      case 2: return "grayscale-[30%] rotate-[-0.5deg]";
      case 3: return "grayscale-[60%] brightness-90 rotate-[-1.5deg]";
      case 4: return "grayscale sepia brightness-50 contrast-125 blur-[0.8px] rotate-[-3deg]";
      default: return "";
    }
  };

  const getHealthColor = (level: number) => {
    if (level === 0) return "bg-lime-400";
    if (level === 1) return "bg-green-400";
    if (level === 2) return "bg-yellow-400";
    if (level === 3) return "bg-orange-500";
    return "bg-red-600";
  };

  const allFilteredAreChecked = useMemo(() => {
    return filteredItems.length > 0 && filteredItems.every(i => i.isChecked);
  }, [filteredItems]);

  const handleMarkAllToggle = () => {
    const ids = filteredItems.map(i => i.id);
    if (ids.length > 0) {
      onMarkAllChecked(ids, !allFilteredAreChecked);
    }
  };

  // DO await onAIRevive since it returns a Promise.
  const handleAudioClick = async (item: ContentItem) => {
    const allowed = await onAIRevive?.() ?? true;
    if (allowed) {
      onInteract(item.id); 
      setActiveAudioItem(item);
    }
  };

  const superHotCount = items.filter(i => (Date.now() - i.lastInteracted) < 24*60*60*1000).length;

  return (
    <div className="wireframe-grid min-h-[80vh] p-8 -m-8 relative">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
          <div className="space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 text-black">My Stash</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-600">Total Brain Cells: {items.length}</p>
                  
                  {/* Streak Info Trigger */}
                  <div className="relative">
                    <div 
                      onMouseEnter={() => setShowStreakTooltip(true)}
                      onMouseLeave={() => setShowStreakTooltip(false)}
                      className={`flex items-center gap-1 font-black text-xs uppercase px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-help hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all ${isAIEnabled ? 'text-lime-600 bg-lime-100' : 'text-gray-400 bg-gray-100'}`}
                    >
                      <Flame size={14} fill="currentColor" /> {superHotCount} Super Hot
                    </div>

                    {/* Streak Rules Tooltip */}
                    <AnimatePresence>
                      {showStreakTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-4 z-[100] w-72 pointer-events-none"
                        >
                          <div className="bg-gray-900 text-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] relative">
                            <div className="absolute -top-2.5 left-6 w-4 h-4 bg-gray-900 border-l-4 border-t-4 border-black rotate-45"></div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                                <Info size={16} className="text-lime-400" />
                                <h4 className="font-black uppercase text-xs tracking-widest text-lime-400">Streak Mechanics</h4>
                              </div>
                              
                              <p className="text-[11px] font-bold leading-relaxed text-gray-300">
                                {isAIEnabled 
                                  ? "Items fade over time if you don’t interact with them." 
                                  : "Momentum tracking is currently DISABLED (AI off)."}
                              </p>

                              {isAIEnabled && (
                                <ul className="space-y-1.5">
                                  <li className="flex items-center gap-2 text-[10px] font-black uppercase">
                                    <div className="w-2 h-2 bg-lime-400 border border-black" />
                                    <span>Hot: Active within 24h</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                                    <div className="w-2 h-2 bg-yellow-400 border border-black" />
                                    <span>Stale: Inactive 7+ days</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500">
                                    <div className="w-2 h-2 bg-red-600 border border-black" />
                                    <span>Strike: Inactive 14+ days</span>
                                  </li>
                                </ul>
                              )}

                              <div className="pt-2 border-t border-white/10">
                                <p className="text-[9px] font-black text-gray-400 uppercase leading-tight">
                                  {isAIEnabled 
                                    ? "Open or mark an item as done to bring it back to Hot." 
                                    : "Connect AI to resume momentum tracking."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative group inline-block">
                  <NeoButton 
                    size="sm" 
                    variant="secondary"
                    onClick={handleMarkAllToggle}
                    disabled={filteredItems.length === 0}
                    className="bg-[#A3E635] text-black border-2 shadow-[2px_2px_0px_black] hover:shadow-[1px_1px_0px_black] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    {allFilteredAreChecked ? <RotateCcw size={14} /> : <CheckCircle size={14} />}
                    {allFilteredAreChecked ? 'Uncheck All' : 'Mark All Checked'}
                  </NeoButton>
                  
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-90 group-hover:scale-100 z-50">
                    <div className="bg-yellow-400 text-black border-2 border-black px-4 py-1.5 font-black text-[11px] uppercase tracking-tighter whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                      <AlertCircle size={14} strokeWidth={3} /> Don't Cheat!
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 border-r-2 border-b-2 border-black rotate-45"></div>
                  </div>
                </div>
              </div>
          </div>
          <div className="flex flex-wrap gap-2">
              {(['ALL', 'STALE', 'UNCHECKED', 'CHECKED'] as const).map((f) => (
                  <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`
                          px-4 py-2 font-black uppercase border-4 border-black transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none
                          ${filter === f ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white hover:bg-gray-100'}
                      `}
                  >
                      {f}
                  </button>
              ))}
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {filteredItems.length === 0 ? (
            <div className="py-20 flex items-center justify-center relative border-8 border-dashed border-black/10 rounded-none bg-white/50 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.05, scale: 1 }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Ghost size={320} strokeWidth={1} className="text-black rotate-[-15deg] animate-idle-float" />
                </motion.div>
                
                <h3 className="text-4xl font-black text-gray-300 uppercase relative z-10 tracking-widest">Memory Void...</h3>
            </div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const decayLevel = isAIEnabled ? getDecayLevel(item.lastInteracted) : 1;
                  const isStale = isAIEnabled && decayLevel >= 3;
                  const isHot = isAIEnabled && decayLevel === 0;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                    >
                      <NeoCard 
                          className={`
                              relative flex flex-col h-full overflow-hidden p-0 transition-all duration-300 rounded-none border-4
                              ${item.isChecked ? 'opacity-30 grayscale blur-[1px]' : isAIEnabled ? getDecayStyles(decayLevel) : ''}
                          `}
                          hoverEffect={!item.isChecked}
                      >
                          {isStale && !item.isChecked && (
                             <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none z-[15] overflow-hidden opacity-20">
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center rotate-45 font-black text-8xl uppercase text-red-600 whitespace-nowrap">STALE STRIKE</div>
                             </div>
                          )}

                          <div className="p-6 flex flex-col flex-grow relative z-10">
                            <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                              {isHot && !item.isChecked && (
                                <div className="bg-lime-400 text-black px-2 py-1 text-[8px] font-black uppercase rotate-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse flex items-center gap-1">
                                  <Flame size={12} fill="currentColor" /> HOT STREAK
                                </div>
                              )}
                              {isStale && !item.isChecked && (
                                <div className="bg-red-600 text-white px-2 py-1 text-[8px] font-black uppercase -rotate-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                                  <AlertTriangle size={12} fill="currentColor" /> DECAYING
                                </div>
                              )}
                              {(!isAIEnabled || isAIOffline) && (
                                <div className="bg-gray-100 text-gray-400 px-2 py-1 text-[8px] font-black uppercase border-2 border-black flex items-center gap-1">
                                  <ZapOff size={10} /> AI OFF
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black px-2 py-1 border-2 border-black uppercase rounded-none ${CATEGORY_COLORS[item.category] || 'bg-gray-200'}`}>
                                    {item.category}
                                </span>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleAudioClick(item); }}
                                    className={`p-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${isAIEnabled && !isAIOffline ? 'bg-orange-400 hover:bg-orange-300' : 'bg-gray-200 cursor-not-allowed grayscale'}`}
                                    title={isAIEnabled && !isAIOffline ? "Hear Briefing & Revive Streak" : "Connect AI to use Audio OS"}
                                  >
                                    <Headphones size={18} strokeWidth={3} />
                                  </button>
                                  {!item.isChecked && item.url !== '#' && (
                                    <a 
                                      href={item.url} 
                                      target="_blank" 
                                      onClick={() => onInteract(item.id)}
                                      className="p-1.5 border-2 border-black bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                    >
                                        <ExternalLink size={18} strokeWidth={3} />
                                    </a>
                                  )}
                                </div>
                            </div>

                            <h3 className={`text-xl font-black uppercase leading-[1.1] mb-2 ${item.isChecked ? 'line-through text-gray-500' : 'text-black'}`}>
                                {item.title}
                            </h3>

                            <div className={`text-[9px] font-black mb-4 uppercase tracking-widest opacity-40`}>
                                Source: {item.source}
                            </div>
                            
                            <p className={`text-xs font-bold border-l-4 pl-3 mb-6 flex-grow leading-tight ${item.isChecked ? 'border-gray-300 text-gray-400' : 'border-black/20 text-black/60'}`}>
                                "{item.summary}"
                            </p>

                            <div className={`mt-auto pt-4 border-t-4 border-black flex justify-between items-center`}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onToggleCheck(item.id); }}
                                    className={`flex items-center gap-2 font-black transition-colors ${item.isChecked ? 'text-gray-400' : 'text-black hover:text-purple-600'}`}
                                >
                                    {item.isChecked ? <CheckSquare size={20} strokeWidth={4} /> : <Square size={20} strokeWidth={4} />}
                                    <span className="uppercase text-[10px] tracking-tighter">{item.isChecked ? 'Done' : 'Mark Done'}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    {isStale && !item.isChecked && (
                                      <button 
                                        // DO await onAIRevive check before continuing interaction.
                                        onClick={async (e) => { e.stopPropagation(); if(await onAIRevive?.()) onInteract(item.id); }}
                                        className={`p-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 ${isAIEnabled && !isAIOffline ? 'bg-lime-400 hover:bg-lime-300' : 'bg-gray-200 grayscale cursor-not-allowed'}`}
                                        title={isAIEnabled && !isAIOffline ? "Revive Streak" : "Connect AI to Revive"}
                                      >
                                        <RefreshCcw size={16} strokeWidth={3} />
                                        <span className="font-black text-[8px] uppercase">Revive</span>
                                      </button>
                                    )}
                                    <button onClick={(e) => handleShare(e, item)} className="p-1.5 border-2 border-black bg-blue-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                                        <Share2 size={16} strokeWidth={3} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }} className="p-1.5 border-2 border-black bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                                        <Trash2 size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                          </div>

                          {isAIEnabled && (
                            <div className="h-4 w-full bg-black border-t-4 border-black relative">
                               <motion.div 
                                  initial={{ width: "100%" }}
                                  animate={{ width: `${Math.max(5, 100 - (decayLevel * 25))}%` }}
                                  className={`h-full ${getHealthColor(decayLevel)} transition-colors duration-500`}
                               />
                               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <span className="text-[7px] font-black text-white uppercase tracking-widest mix-blend-difference">
                                     Brain Health
                                  </span>
                               </div>
                            </div>
                          )}
                      </NeoCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <EarWorm 
        isOpen={!!activeAudioItem} 
        onClose={() => setActiveAudioItem(null)} 
        items={items} 
        singleItem={activeAudioItem} 
      />

      <AnimatePresence>
        {itemToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <NeoCard className="bg-white p-8 max-sm border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-4 bg-red-100 border-4 border-black"><AlertTriangle size={48} className="text-red-600" /></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Wipe Memory?</h3>
                  <p className="font-bold text-gray-500 text-sm">Deleting this will permanently remove it from your brain web.</p>
                  <div className="flex flex-col w-full gap-4">
                    <NeoButton variant="danger" onClick={() => { onDeleteItem(itemToDelete.id); setItemToDelete(null); }}>Erase Forever</NeoButton>
                    <button onClick={() => setItemToDelete(null)} className="font-black uppercase text-xs">Keep it</button>
                  </div>
                </div>
            </NeoCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsView;
