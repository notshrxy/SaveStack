
// DO NOT add any new files, classes, or namespaces.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Loader2, Headphones, Activity, Maximize2, Minus } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import { ContentItem } from '../types';
import { generateAudioBriefing } from '../services/geminiService';

interface EarWormProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  singleItem?: ContentItem | null;
  // DO define onAIError prop to match the usage in App.tsx.
  onAIError?: (err: any) => void;
}

// Helper: Decode base64 string to bytes
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

// Helper: Decode PCM bytes to AudioBuffer
const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
};

const EarWorm: React.FC<EarWormProps> = ({ isOpen, onClose, items, singleItem, onAIError }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const startBriefing = async () => {
    setLoading(true);
    const targets = singleItem ? [singleItem] : items.slice(0, 3);
    try {
      const audioData = await generateAudioBriefing(targets);
      if (!audioData) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlaying(false);
      
      sourceNodeRef.current = source;
      source.start();
      setPlaying(true);
    } catch (err) {
      console.error(err);
      // DO notify parent of AI errors to handle re-validation.
      onAIError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const stopBriefing = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Silently catch if already stopped
      }
      setPlaying(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
        stopBriefing();
        setIsDocked(false);
    }
    return () => stopBriefing();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Background Overlay - Fades independently */}
      <AnimatePresence>
        {!isDocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className={`w-full h-full flex p-6 md:p-8 transition-all duration-700 ease-in-out ${!isDocked ? 'items-center justify-center' : 'items-end justify-start'}`}>
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ originX: 0, originY: 1 }}
          className={`w-full pointer-events-auto ${isDocked ? 'max-w-[280px]' : 'max-w-md'}`}
        >
          <NeoCard 
            className={`${isDocked ? 'bg-orange-500' : 'bg-orange-400'} ${isDocked ? 'p-4 md:p-6' : 'p-8'} relative border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all`}
          >
            {/* Header Actions */}
            <div className={`absolute ${isDocked ? 'top-2 right-2' : 'top-4 right-4'} flex gap-2 z-20`}>
              {isDocked ? (
                <button 
                    onClick={() => setIsDocked(false)} 
                    className="p-1.5 bg-white text-black border-2 border-black hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                    title="Maximize"
                >
                    <Maximize2 size={14} strokeWidth={3} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsDocked(true)} 
                  className="p-2 bg-white text-black border-4 border-black hover:bg-cyan-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  title="Minimize"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
              )}
              <button 
                onClick={onClose} 
                className={`p-1.5 bg-black text-white border-2 border-white hover:bg-red-600 transition-all ${isDocked ? 'shadow-none' : 'shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'}`}
              >
                <X size={isDocked ? 16 : 20} />
              </button>
            </div>

            <div className={`flex flex-col items-center ${isDocked ? 'gap-4' : 'gap-6'}`}>
              {/* Branding (Upright Typography) */}
              <AnimatePresence mode="popLayout">
                {!isDocked && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black text-white p-2 w-full text-center border-4 border-white mb-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  >
                    <h2 className="text-3xl font-black uppercase tracking-widest">StashCast</h2>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">YOUR DAILY BUGLE</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cassette Animation */}
              <motion.div layout className={`w-full ${isDocked ? 'h-24' : 'h-40'} bg-gray-200 border-4 border-black relative overflow-hidden flex items-center justify-center shadow-inner transition-all duration-500`}>
                <div className={`w-4/5 ${isDocked ? 'h-14' : 'h-24'} bg-gray-800 border-4 border-black rounded-lg flex justify-around items-center px-4 relative ${playing ? 'animate-pulse' : ''}`}>
                   <div className={`${isDocked ? 'w-8 h-8' : 'w-14 h-14'} rounded-full border-4 border-black bg-gray-400 relative ${playing ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
                      <div className="absolute inset-0 m-auto w-1 h-full bg-black/40"></div>
                      <div className="absolute inset-0 m-auto w-full h-1 bg-black/40"></div>
                   </div>
                   <div className="flex flex-col gap-1 items-center">
                      <div className={`${isDocked ? 'w-6' : 'w-12'} h-2 bg-gray-900 border border-black`}></div>
                      <div className={`${isDocked ? 'w-6' : 'w-12'} h-2 bg-gray-900 border border-black`}></div>
                   </div>
                   <div className={`${isDocked ? 'w-8 h-8' : 'w-14 h-14'} rounded-full border-4 border-black bg-gray-400 relative ${playing ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
                      <div className="absolute inset-0 m-auto w-1 h-full bg-black/40"></div>
                      <div className="absolute inset-0 m-auto w-full h-1 bg-black/40"></div>
                   </div>
                </div>
                <div className="absolute bottom-4 w-1/2 h-1 bg-black/20 rounded-full"></div>
              </motion.div>

              {/* Status Display */}
              <motion.div layout className={`w-full bg-white border-4 border-black ${isDocked ? 'p-2' : 'p-4'} text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={isDocked ? 18 : 24} className="animate-spin text-orange-600" />
                    <span className={`font-black uppercase ${isDocked ? 'text-[10px]' : 'text-sm'}`}>Mixing...</span>
                  </div>
                ) : playing ? (
                  <div className="space-y-0.5 overflow-hidden">
                     <p className={`font-black uppercase ${isDocked ? 'text-[8px]' : 'text-xs'} text-orange-600 animate-pulse`}>On Air</p>
                     <p className={`font-bold ${isDocked ? 'text-sm' : 'text-lg'} truncate px-2 leading-tight`}>{singleItem ? singleItem.title : "Daily Tape"}</p>
                  </div>
                ) : (
                  <p className={`font-black uppercase tracking-widest text-gray-400 ${isDocked ? 'text-[10px]' : 'text-sm'}`}>Ready to play</p>
                )}
              </motion.div>

              {/* Action Button */}
              <NeoButton 
                fullWidth 
                className={`${isDocked ? 'py-3 text-lg border-2' : 'py-8 text-4xl'}`} 
                onClick={playing ? stopBriefing : startBriefing}
                disabled={loading}
                variant={playing ? "danger" : "primary"}
              >
                {playing ? <Square size={isDocked ? 18 : 40} fill="currentColor" /> : <Play size={isDocked ? 18 : 40} fill="currentColor" />}
                <span className={`ml-3 font-black tracking-tighter ${isDocked ? 'text-sm' : ''}`}>{playing ? 'STOP' : 'PLAY'}</span>
              </NeoButton>

              {/* Technical Metadata */}
              <AnimatePresence>
                {!isDocked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-4 text-[10px] font-black uppercase text-white/40"
                  >
                    <span className="flex items-center gap-1">
                      <Activity size={12} /> 24kHz MONO
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones size={12} /> STACK.VOX
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </NeoCard>
        </motion.div>
      </div>
    </div>
  );
};

export default EarWorm;