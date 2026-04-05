
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Timer as TimerIcon, Coffee } from 'lucide-react';
import NeoCard from './ui/NeoCard';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ isOpen, onClose }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK' | 'CUSTOM'>('FOCUS');
  const [customValue, setCustomValue] = useState(10);
  const [customSecs, setCustomSecs] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Play a raw notification sound here if desired
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'FOCUS') setSeconds(25 * 60);
    else if (mode === 'BREAK') setSeconds(5 * 60);
    else setSeconds(customValue * 60 + customSecs);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 right-6 z-[130] pointer-events-auto cursor-move"
    >
      <NeoCard className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-64 select-none">
        <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <TimerIcon size={16} />
            <span className="font-black uppercase text-[10px] tracking-widest">{mode} FLOW</span>
          </div>
          <button onClick={onClose} className="hover:scale-110 transition-transform">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="text-center py-4">
          <h2 className="text-5xl font-black font-mono tracking-tighter mb-6">{formatTime(seconds)}</h2>

          <div className="flex gap-2 justify-center mb-6">
            <button
              onClick={() => { setMode('FOCUS'); setSeconds(25 * 60); setIsActive(false); }}
              className={`px-3 py-1 font-black text-[10px] border-2 border-black uppercase ${mode === 'FOCUS' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Study
            </button>
            <button
              onClick={() => { setMode('BREAK'); setSeconds(5 * 60); setIsActive(false); }}
              className={`px-3 py-1 font-black text-[10px] border-2 border-black uppercase ${mode === 'BREAK' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Chill
            </button>
            <button
              onClick={() => { setMode('CUSTOM'); setSeconds(customValue * 60 + customSecs); setIsActive(false); }}
              className={`px-3 py-1 font-black text-[10px] border-2 border-black uppercase ${mode === 'CUSTOM' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Custom
            </button>
          </div>

          {mode === 'CUSTOM' && (
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={customValue}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setCustomValue(val);
                      setSeconds(val * 60 + customSecs);
                    }}
                    className="w-14 px-2 py-1 border-2 border-black font-black text-center focus:outline-none bg-yellow-50"
                  />
                  <span className="font-black text-[8px] uppercase opacity-60 tracking-tighter">Mins</span>
                </div>

                <span className="font-black text-xl">:</span>

                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSecs}
                    onChange={(e) => {
                      const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                      setCustomSecs(val);
                      setSeconds(customValue * 60 + val);
                    }}
                    className="w-14 px-2 py-1 border-2 border-black font-black text-center focus:outline-none bg-yellow-50"
                  />
                  <span className="font-black text-[8px] uppercase opacity-60 tracking-tighter">Secs</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 font-black uppercase text-sm ${isActive ? 'bg-orange-400' : 'bg-lime-400'}`}
            >
              {isActive ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 bg-white"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-black/10 flex items-center gap-3 opacity-60">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-lime-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-[10px] font-bold uppercase">{isActive ? 'Clock ticking...' : 'Ready to focus?'}</span>
        </div>
      </NeoCard>
    </motion.div>
  );
};

export default FocusTimer;
