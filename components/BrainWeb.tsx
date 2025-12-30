
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, RefreshCw, HelpCircle, AlertCircle } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import { ContentItem, SemanticConnection } from '../types';
import { analyzeConnections } from '../services/geminiService';

interface BrainWebProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
}

const BrainWeb: React.FC<BrainWebProps> = ({ isOpen, onClose, items }) => {
  const [connections, setConnections] = useState<SemanticConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize graph when opened
  useEffect(() => {
    if (isOpen && items.length > 0) {
      loadGraph();
    }
  }, [isOpen]);

  const loadGraph = async () => {
    setLoading(true);
    try {
      // Calculate positions relative to a fixed modal size for predictability
      // Assuming a modal size around 1000x600 as a reference
      const initialPos: Record<string, { x: number, y: number }> = {};
      items.slice(0, 10).forEach((item) => {
        initialPos[item.id] = {
          x: 50 + Math.random() * 600,
          y: 50 + Math.random() * 400
        };
      });
      setPositions(initialPos);

      if (items.length > 1) {
        const conn = await analyzeConnections(items.slice(0, 10));
        setConnections(conn);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (id: string, info: any) => {
    setPositions(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { x: prev[id].x + info.delta.x, y: prev[id].y + info.delta.y }
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      {/* Dark Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Pop-up Container */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-6xl h-[85vh] bg-white border-8 border-black shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden z-10"
      >
        {/* Modal Header */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 border-2 border-white">
              <Network size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Brain Web Explorer</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Semantic Connection Map</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-600 transition-colors border-2 border-transparent hover:border-white"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Graph Workspace Area */}
        <div 
          ref={containerRef}
          className="flex-grow relative bg-[#222] bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] overflow-hidden select-none"
        >
          {/* Controls Overlay */}
          <div className="absolute top-6 left-6 z-30 pointer-events-none">
            <button 
              onClick={loadGraph}
              disabled={loading}
              className="pointer-events-auto bg-yellow-400 border-4 border-black px-4 py-2 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              {loading ? 'Analyzing...' : 'Refresh Connections'}
            </button>
          </div>

          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {connections.map((conn, i) => {
              const from = positions[conn.fromId];
              const to = positions[conn.toId];
              if (!from || !to) return null;
              
              // Center point offset for the sticky note size (approx 144x96)
              const offset = { x: 72, y: 48 };
              
              return (
                <motion.path
                  key={`${conn.fromId}-${conn.toId}-${i}`}
                  d={`M ${from.x + offset.x} ${from.y + offset.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + 80} ${to.x + offset.x} ${to.y + offset.y}`}
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                />
              );
            })}
          </svg>

          {/* Draggable Sticky Notes */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {items.slice(0, 15).map((item, i) => {
              const pos = positions[item.id];
              if (!pos) return null;

              return (
                <motion.div
                  key={item.id}
                  drag
                  onDrag={(e, info) => handleDrag(item.id, info)}
                  dragMomentum={false}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
                >
                  <NeoCard 
                    className={`w-36 p-3 transform transition-shadow rotate-${(i % 5) - 2} ${i % 2 === 0 ? 'bg-yellow-100' : 'bg-cyan-50'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black/60`}
                  >
                    <div className="w-3 h-3 bg-red-900 rounded-full border-2 border-black absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
                    <p className="text-[7px] font-black uppercase text-black/40 mb-1 leading-none">{item.category}</p>
                    <h3 className="text-[10px] font-black uppercase leading-tight line-clamp-2">{item.title}</h3>
                  </NeoCard>
                </motion.div>
              );
            })}

            {items.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                 <AlertCircle size={80} strokeWidth={1} />
                 <p className="font-black uppercase text-2xl tracking-widest">Stash is empty</p>
              </div>
            )}
          </div>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-6 right-6 z-30 pointer-events-none max-w-[240px]">
            <NeoCard className="bg-white/95 backdrop-blur-sm p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-2 border-b-2 border-black pb-1">
                <HelpCircle size={14} />
                <h4 className="font-black uppercase text-[10px]">Graph Guide</h4>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[8px] font-bold uppercase text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Red Strings: Semantic Links
                </li>
                <li className="flex items-center gap-2 text-[8px] font-bold uppercase text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-yellow-100 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Drag Cards: Sort your mind
                </li>
              </ul>
            </NeoCard>
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-gray-100 border-t-4 border-black p-4 shrink-0 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-gray-500">System Ready</span>
           </div>
           <div className="h-4 w-[2px] bg-black/10" />
           <span className="text-[9px] font-black uppercase text-gray-500">Mapping {items.length} Brain Cells</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BrainWeb;
