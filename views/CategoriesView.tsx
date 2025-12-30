import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, ContentItem, CATEGORY_COLORS } from '../types';
import NeoCard from '../components/ui/NeoCard';
import { Code2, PenTool, Layout, Gamepad2, BrainCircuit, Wrench, Folder, Image as ImageIcon, FileText } from 'lucide-react';

// --- EXPLOSION LOGIC ---
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: 'square' | 'triangle' | 'circle';
  angle: number;
  velocity: number;
}

const ParticleExplosion: React.FC<{ x: number; y: number; isHover?: boolean }> = ({ x, y, isHover = false }) => {
  const count = isHover ? 6 : 12;
  const particles: Particle[] = Array.from({ length: count }).map((_, i) => ({
    id: Math.random(),
    x,
    y,
    color: ['#A3E635', '#B088FF', '#FFC107', '#FF5722', '#00BCD4'][Math.floor(Math.random() * 5)],
    size: isHover ? (Math.random() * 10 + 5) : (Math.random() * 15 + 8),
    shape: ['square', 'triangle'][Math.floor(Math.random() * 2)] as any, // Circles removed for hover per request, sticking to geometric
    angle: Math.random() * Math.PI * 2,
    velocity: isHover ? (Math.random() * 100 + 50) : (Math.random() * 200 + 100),
  }));

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: p.x + Math.cos(p.angle) * p.velocity,
            y: p.y + Math.sin(p.angle) * p.velocity,
            opacity: 0,
            scale: 0.2,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: isHover ? 0.4 : 0.8, ease: "easeOut" }}
          className="fixed pointer-events-none z-[5] border-2 border-black"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '0%', // Strictly geometric
            clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
            boxShadow: '2px 2px 0px black'
          }}
        />
      ))}
    </>
  );
};

// --- MAIN COMPONENT ---
interface CategoriesViewProps {
  items: ContentItem[];
  selectedCategory: Category | 'ALL';
  onSelectCategory: (cat: Category) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ items, selectedCategory, onSelectCategory }) => {
  const [explosions, setExplosions] = useState<{ x: number, y: number, id: number, isHover: boolean }[]>([]);

  const getCount = (cat: Category) => items.filter(i => i.category === cat).length;

  const triggerExplosion = (e: React.MouseEvent, isHover: boolean = false) => {
    const newExplosion = { x: e.clientX, y: e.clientY, id: Date.now() + Math.random(), isHover };
    setExplosions(prev => [...prev, newExplosion]);
    
    // Cleanup explosions after they finish to keep DOM clean
    setTimeout(() => {
      setExplosions(prev => prev.filter(ex => ex.id !== newExplosion.id));
    }, 1000);
  };

  const handleCardClick = (e: React.MouseEvent, catId: Category) => {
    triggerExplosion(e, false);
    onSelectCategory(catId);
  };

  const handleCardHover = (e: React.MouseEvent) => {
    triggerExplosion(e, true);
  };

  const categories = [
    { id: Category.FULL_STACK, icon: Code2, desc: "Frontend, Backend, DBs", gridClass: "md:col-span-2 md:row-span-2" },
    { id: Category.UI_UX, icon: Layout, desc: "Figma, Wireframes, User Research", gridClass: "" },
    { id: Category.DESIGN, icon: PenTool, desc: "Graphic Design, Trends, Art", gridClass: "md:row-span-2" },
    { id: Category.GAME_DEV, icon: Gamepad2, desc: "Unity, Unreal, C#", gridClass: "" },
    { id: Category.AI_ML, icon: BrainCircuit, desc: "LLMs, Python, Data Science", gridClass: "md:col-span-2" },
    { id: Category.TOOLS, icon: Wrench, desc: "VS Code, Notion, Productivity", gridClass: "" },
    { id: Category.SCREENSHOTS, icon: ImageIcon, desc: "Visual inspiration", gridClass: "" },
    { id: Category.NOTES, icon: FileText, desc: "Docs & reminders", gridClass: "" },
    { id: Category.OTHER, icon: Folder, desc: "Everything else", gridClass: "" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    },
  };

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {explosions.map(ex => (
          <ParticleExplosion key={ex.id} x={ex.x} y={ex.y} isHover={ex.isHover} />
        ))}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-16 relative z-10"
      >
        <div className="relative inline-block">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 relative z-10 drop-shadow-[4px_4px_0px_#A3E635]">
            Archives
          </h2>
          <div className="absolute -top-4 -right-8 w-24 h-24 bg-pink-400 border-4 border-black rotate-12 -z-10 shadow-[8px_8px_0px_black] flex items-center justify-center font-black text-xs uppercase">
            Top Secret
          </div>
        </div>
        <p className="text-xl font-bold border-l-8 border-black pl-4 ml-4">Browse your second brain. Keep the learning balanced.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
      >
        {categories.map((cat) => {
            const count = getCount(cat.id);
            const Icon = cat.icon;
            
            return (
                <motion.div key={cat.id} variants={itemVariants} className={cat.gridClass}>
                  <NeoCard 
                      color={CATEGORY_COLORS[cat.id]}
                      hoverEffect
                      onMouseEnter={(e) => handleCardHover(e)}
                      onClick={(e) => handleCardClick(e, cat.id)}
                      className="group h-full relative flex flex-col justify-between"
                  >
                      {/* Halftone Pattern Overlay - Constrained to internal bounds */}
                      <div className="absolute inset-0 opacity-[0.12] pointer-events-none group-hover:opacity-[0.22] transition-opacity overflow-hidden" 
                           style={{ 
                             backgroundImage: `radial-gradient(circle, #000 1.2px, transparent 1.2px)`,
                             backgroundSize: '7px 7px' 
                           }}></div>

                      <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="relative group/tooltip">
                              <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                                  <Icon size={32} strokeWidth={2.5} />
                              </div>
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white border-2 border-white px-3 py-1 font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(176,136,255,1)] opacity-0 group-hover/tooltip:opacity-100 transition-all scale-75 group-hover/tooltip:scale-100 pointer-events-none z-30 whitespace-nowrap">
                                  {cat.id}
                              </div>
                          </div>

                          <div className="bg-black text-white px-4 py-2 font-black text-2xl border-4 border-white shadow-[4px_4px_0px_black]">
                              {count}
                          </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black uppercase mb-2 leading-none group-hover:skew-x-3 transition-transform">{cat.id}</h3>
                        <p className="font-bold text-sm opacity-90 leading-tight uppercase">{cat.desc}</p>
                      </div>

                      {/* Random Decorative Dots */}
                      <div className="absolute bottom-4 right-4 flex gap-1">
                        <div className="w-2 h-2 bg-black"></div>
                        <div className="w-2 h-2 bg-black opacity-40"></div>
                        <div className="w-2 h-2 bg-black opacity-10"></div>
                      </div>
                  </NeoCard>
                </motion.div>
            );
        })}
      </motion.div>

      {/* Background Large Text Decor */}
      <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] select-none -z-10 translate-y-20">
        <h1 className="text-[25rem] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
          CAT_LOGUE_BRAIN_DATA
        </h1>
      </div>
    </div>
  );
};

export default CategoriesView;