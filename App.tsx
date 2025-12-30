
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import ProjectsView from './views/ProjectsView';
import CategoriesView from './views/CategoriesView';
import AuthView from './views/AuthView';
import BrainWeb from './components/BrainWeb';
import AddContentModal from './components/AddContentModal';
import SaveStackGenie from './components/SummaryPanel'; 
import HelpChatbot from './components/HelpChatbot';
import QuizModal from './components/QuizModal';
import FocusTimer from './components/FocusTimer';
import EarWorm from './components/EarWorm';
import FloatingShapes from './components/ui/FloatingShapes';
import GuideModal from './components/GuideModal';
import StashCastGuide from './components/StashCastGuide';
import AntiHoardGuide from './components/AntiHoardGuide';
import SemanticWebGuide from './components/SemanticWebGuide';
import KeyOnboarding from './components/KeyOnboarding';
import SetupOnboarding from './components/SetupOnboarding';
import NeoCard from './components/ui/NeoCard';
import NeoButton from './components/ui/NeoButton';
import { ContentItem, ViewState, Category, RecentActivityEntry, AIProvider } from './types';
import { MOCK_ITEMS } from './constants';
import { dbService } from './services/db';
import { supabase } from './services/supabaseClient';
import { vaultService } from './services/vaultService';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(false);
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isEarWormOpen, setIsEarWormOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStashCastGuideOpen, setIsStashCastGuideOpen] = useState(false);
  const [isAntiHoardGuideOpen, setIsAntiHoardGuideOpen] = useState(false);
  const [isSemanticWebGuideOpen, setIsSemanticWebGuideOpen] = useState(false);
  
  const [isAIOffline, setIsAIOffline] = useState(true);
  const [isAIEnabled, setIsAIEnabled] = useState(() => {
    const saved = localStorage.getItem('SAVESTACK_AI_ENABLED');
    return saved === null ? true : saved === 'true';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSetupOnboarding, setShowSetupOnboarding] = useState(false);
  const [hasSkippedOnboarding, setHasSkippedOnboarding] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<RecentActivityEntry[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    localStorage.setItem('SAVESTACK_AI_ENABLED', String(isAIEnabled));
  }, [isAIEnabled]);

  const handleAIError = useCallback((err: any) => {
    if (err?.message?.includes("NEURAL_LINK_DISCONNECTED") || err?.message?.includes("Requested entity was not found") || err?.message?.includes("API_KEY_INVALID")) {
      setIsAIOffline(true);
      if (user) setShowKeyModal(true);
    }
  }, [user]);

  const checkAIStatus = useCallback(async () => {
    try {
      const hasKeyCached = localStorage.getItem('SAVESTACK_HAS_GEMINI_KEY') === 'true';
      if (hasKeyCached) {
        setIsAIOffline(false);
        return true;
      }

      const vaultedGemini = await vaultService.getKey(AIProvider.GEMINI);
      if (vaultedGemini) {
        localStorage.setItem('SAVESTACK_HAS_GEMINI_KEY', 'true');
        setIsAIOffline(false);
        return true;
      }

      if (process.env.API_KEY) {
        setIsAIOffline(false);
        return true;
      }

      setIsAIOffline(true);
      return false;
    } catch (e) {
      setIsAIOffline(true);
      return false;
    }
  }, []);

  /**
   * App Initializer: Prioritize UI Mounting with Hydration Safety.
   */
  useEffect(() => {
    const init = async () => {
      // Safety release: Never let the app hang on startup
      const startupTimeout = setTimeout(() => {
        if (isInitializing) setIsInitializing(false);
      }, 5000);

      try {
        // 1. Explicitly open the DB
        await dbService.open();

        // 2. Load data and check if we need to seed
        const localItems = await dbService.getAllItems();
        const hasBeenInitialized = localStorage.getItem('SAVESTACK_DB_INITIALIZED') === 'true';

        if (localItems.length === 0 && !hasBeenInitialized) {
          // First time user: Seed with MOCK_ITEMS
          console.log("🌱 Seeding SaveStack with initial brain cells...");
          const itemsToSave = [...MOCK_ITEMS].map(item => ({
            ...item, 
            lastInteracted: Date.now()
          }));
          for (const item of itemsToSave) {
            await dbService.saveItem(item);
          }
          setItems(itemsToSave);
          localStorage.setItem('SAVESTACK_DB_INITIALIZED', 'true');
        } else {
          // Returning user: Load their stash
          console.log(`🧠 Hydrated ${localItems.length} items from your brain.`);
          setItems(localItems.sort((a, b) => b.dateAdded - a.dateAdded));
        }

        // 3. Identity check
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
          setUser(session?.user ?? null);
          checkAIStatus();
        });

        // 4. Background Onboarding logic
        const onboardingDone = localStorage.getItem('SAVESTACK_ONBOARDING_COMPLETED') === 'true';
        if (!onboardingDone) {
          setTimeout(() => setShowSetupOnboarding(true), 1000);
        }

        // 5. App is ready
        clearTimeout(startupTimeout);
        setIsInitializing(false);
      } catch (err) {
        console.error("Critical Hydration Error:", err);
        setIsInitializing(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) checkAIStatus();
    });

    return () => subscription.unsubscribe();
  }, [checkAIStatus]);

  useEffect(() => {
    if (history.length === 0 && items.length > 0) {
      setHistory(items.slice(0, 3).map(item => ({ type: 'ITEM', data: item })));
    }
  }, [items]);

  const withAIGuard = useCallback(async (action: () => void) => {
    if (!user) {
      setCurrentView('AUTH');
      return;
    }
    const hasKey = await checkAIStatus();
    if (!hasKey) {
      setShowKeyModal(true);
      return;
    }
    action();
  }, [user, checkAIStatus]);

  const triggerReEnableAI = () => {
    if (user) setShowKeyModal(true);
    else setCurrentView('AUTH');
  };

  const addToHistory = (entry: RecentActivityEntry) => {
    setHistory(prev => {
      const filtered = prev.filter(e => {
        if (e.type === entry.type) {
          if (e.type === 'ITEM' && entry.type === 'ITEM') return e.data.id !== entry.data.id;
          if (e.type === 'CATEGORY' && entry.type === 'CATEGORY') return e.data !== entry.data;
        }
        return true;
      });
      return [entry, ...filtered].slice(0, 3);
    });
  };

  const handleViewChange = (view: ViewState) => {
    if (!user && view !== 'AUTH') {
      setCurrentView('AUTH');
      return;
    }
    setCurrentView(view);
    if (view !== 'PROJECTS' && view !== 'ABOUT_US') {
        setCategoryFilter('ALL');
        setSearchQuery('');
    }
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (category: Category) => {
    addToHistory({ type: 'CATEGORY', data: category });
    setCategoryFilter(category);
    setCurrentView('PROJECTS');
    window.scrollTo(0, 0);
  };

  const handleSaveItem = async (newItem: ContentItem) => {
    const itemWithStreak = { ...newItem, lastInteracted: Date.now() };
    await dbService.saveItem(itemWithStreak);
    setItems(prev => [itemWithStreak, ...prev]);
    addToHistory({ type: 'ITEM', data: itemWithStreak });
    setCurrentView('PROJECTS');
    setCategoryFilter('ALL');
  };

  const handleToggleCheck = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const updates = { isChecked: !item.isChecked, lastInteracted: Date.now() };
      await dbService.updateItem(id, updates);
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  };

  const handleMarkAllChecked = async (ids: string[], isChecked: boolean = true) => {
    await dbService.bulkUpdate(ids, { isChecked, lastInteracted: Date.now() });
    setItems(prev => prev.map(item => 
      ids.includes(item.id) ? { ...item, isChecked, lastInteracted: Date.now() } : item
    ));
  };

  const handleInteract = async (id: string) => {
    const now = Date.now();
    await dbService.updateItem(id, { lastInteracted: now });
    setItems(prev => prev.map(item => item.id === id ? { ...item, lastInteracted: now } : item));
  };

  const handleDeleteItem = async (id: string) => {
    await dbService.deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReorderItems = (newOrder: ContentItem[]) => setItems(newOrder);

  const filteredItems = items.filter(item => {
    return searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 size={64} className="animate-spin text-purple-600" strokeWidth={3} />
            <p className="font-black uppercase tracking-widest text-sm animate-pulse">Initializing Brain Hub...</p>
         </div>
      </div>
    );
  }

  const isAuthOnly = !user && !showSetupOnboarding;

  return (
    <div className={`min-h-screen transition-colors duration-500 text-black font-sans selection:bg-purple-300 relative ${(currentView === 'ABOUT_US' || currentView === 'PROJECTS') ? 'bg-transparent' : 'bg-[#fdfdfd]'}`}>
      
      <AnimatePresence>
        {showSetupOnboarding && <SetupOnboarding onComplete={() => setShowSetupOnboarding(false)} />}
      </AnimatePresence>

      {/* humane Session Guard */}
      {isAuthOnly && currentView !== 'AUTH' && (
        <div className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
             <NeoCard className="bg-white border-[10px] border-black shadow-[30px_30px_0px_rgba(176,136,255,1)] text-center p-12 md:p-16">
                <div className="bg-[#B088FF] p-6 border-4 border-black w-24 h-24 flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_black]">
                  <Sparkles size={48} className="text-white" strokeWidth={3} />
                </div>
                <h2 className="text-5xl font-black uppercase mb-6 tracking-tighter lineage-[0.9]">STASH NOT SYNCED.</h2>
                <NeoButton fullWidth onClick={() => setCurrentView('AUTH')} size="lg" className="!bg-black !text-white text-2xl py-8 shadow-[10px_10px_0px_#A3E635]">
                  LET'S SYNC YOUR STASH <ArrowRight size={28} className="ml-3" strokeWidth={3} />
                </NeoButton>
             </NeoCard>
           </motion.div>
        </div>
      )}

      {showKeyModal && (
        <KeyOnboarding 
          isLoggedIn={!!user}
          onGoToAuth={() => { setShowKeyModal(false); setCurrentView('AUTH'); }}
          onSuccess={() => { setIsAIOffline(false); setIsAIEnabled(true); setShowKeyModal(false); }} 
          onSkip={() => { setHasSkippedOnboarding(true); setShowKeyModal(false); }}
          onDisableAI={() => { setIsAIEnabled(false); setShowKeyModal(false); }}
          isReopened={hasSkippedOnboarding || !isAIEnabled}
        />
      )}

      <FloatingShapes />
      
      <Navbar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        onOpenAddModal={() => user ? setIsAddModalOpen(true) : setCurrentView('AUTH')}
        onOpenGuide={() => setIsGuideOpen(true)}
        className={isAuthOnly ? 'pointer-events-none opacity-10' : ''}
      />

      <div className={`relative z-10 overflow-x-hidden min-h-screen ${currentView === 'HOME' ? 'pt-16 md:pt-20' : 'pt-28 md:pt-32'} ${isAuthOnly && currentView !== 'AUTH' ? 'pointer-events-none filter grayscale brightness-50' : ''}`}>
        <main className="max-w-[1500px] mx-auto px-6 md:px-12 pb-12">
          {currentView === 'HOME' && (
              <HomeView 
                  onChangeView={handleViewChange} 
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onOpenSummaryPanel={() => withAIGuard(() => setIsSummaryPanelOpen(true))}
                  onOpenHelpChat={() => withAIGuard(() => setIsHelpChatOpen(true))}
                  onOpenQuiz={() => withAIGuard(() => setIsQuizOpen(true))}
                  onOpenTimer={() => setIsTimerOpen(true)}
                  onOpenEarWorm={() => withAIGuard(() => setIsEarWormOpen(true))}
                  onOpenStashCastGuide={() => setIsStashCastGuideOpen(true)}
                  onOpenAntiHoardGuide={() => setIsAntiHoardGuideOpen(true)}
                  onOpenSemanticWebGuide={() => setIsSemanticWebGuideOpen(true)}
                  onOpenBrainWeb={() => withAIGuard(() => handleViewChange('BRAIN_WEB'))}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  history={history}
                  onCategorySelect={handleCategorySelect}
                  isAIEnabled={isAIEnabled}
                  isAIOffline={isAIOffline}
                  onTriggerReEnableAI={triggerReEnableAI}
              />
          )}
          
          {currentView === 'PROJECTS' && (
              <ProjectsView 
                  items={filteredItems} 
                  onToggleCheck={handleToggleCheck}
                  onMarkAllChecked={handleMarkAllChecked}
                  onDeleteItem={handleDeleteItem}
                  onReorder={handleReorderItems}
                  onInteract={handleInteract}
                  initialFilter={categoryFilter}
                  isAIEnabled={isAIEnabled}
                  isAIOffline={isAIOffline}
                  onAIRevive={async () => {
                    if (!isAIEnabled || isAIOffline) {
                      triggerReEnableAI();
                      return false;
                    }
                    return true;
                  }}
              />
          )}

          {currentView === 'ABOUT_US' && (
              <CategoriesView 
                  items={items} 
                  selectedCategory={categoryFilter}
                  onSelectCategory={handleCategorySelect} 
              />
          )}

          {currentView === 'AUTH' && (
            <AuthView 
              user={user} 
              itemsCount={items.length}
              hasKeys={!isAIOffline} 
              onOpenKeys={() => setShowKeyModal(true)} 
            />
          )}
        </main>
      </div>

      {currentView === 'BRAIN_WEB' && (
        <BrainWeb items={items} isOpen={true} onClose={() => handleViewChange('HOME')} />
      )}

      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveItem}
        isAIOffline={isAIOffline || !isAIEnabled}
        onTriggerAIOnboarding={triggerReEnableAI}
      />

      <SaveStackGenie 
        isOpen={isSummaryPanelOpen}
        onClose={() => setIsSummaryPanelOpen(false)}
        items={items}
        onAIError={handleAIError}
      />

      <HelpChatbot 
        isOpen={isHelpChatOpen}
        onClose={() => setIsHelpChatOpen(false)}
        onAIError={handleAIError}
      />

      <QuizModal 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        items={items}
        onAIError={handleAIError}
      />

      <FocusTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />

      <EarWorm 
        isOpen={isEarWormOpen}
        onClose={() => setIsEarWormOpen(false)}
        items={items}
        onAIError={handleAIError}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <AnimatePresence>
        {isStashCastGuideOpen && <StashCastGuide isOpen={isStashCastGuideOpen} onClose={() => setIsStashCastGuideOpen(false)} />}
        {isAntiHoardGuideOpen && <AntiHoardGuide isOpen={isAntiHoardGuideOpen} onClose={() => setIsAntiHoardGuideOpen(false)} />}
        {isSemanticWebGuideOpen && <SemanticWebGuide isOpen={isSemanticWebGuideOpen} onClose={() => setIsSemanticWebGuideOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
