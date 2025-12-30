import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, PartyPopper } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';

interface SetupOnboardingProps {
  onComplete: () => void;
}

const SetupOnboarding: React.FC<SetupOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'invite' | 'confirm'>('invite');

  useEffect(() => {
    if (step === 'confirm') {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {step === 'invite' ? (
          <motion.div
            key="invite"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-lg"
          >
            <NeoCard className="bg-white border-[8px] border-black shadow-[15px_15px_0px_0px_rgba(176,136,255,1)] p-10 text-center">
              <div className="bg-[#A3E635] w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_black] rotate-3">
                <Sparkles size={40} className="text-black" strokeWidth={3} />
              </div>
              
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">
                HEY THERE!<br/>
                <span className="text-purple-600">GOT FIVE MINUTES?</span>
              </h2>
              
              <p className="font-bold text-gray-500 mb-10 text-lg leading-tight uppercase">
                Let's get your quick setup done so you can start stashing smarter.
              </p>

              <div className="flex flex-col gap-4">
                <NeoButton 
                  size="lg" 
                  fullWidth 
                  onClick={() => setStep('confirm')}
                  className="!bg-black !text-white py-6 text-2xl shadow-[8px_8px_0px_rgba(163,230,53,1)]"
                >
                  SURE! <ArrowRight size={24} className="ml-2" strokeWidth={3} />
                </NeoButton>
                <button 
                  onClick={onComplete}
                  className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </NeoCard>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="w-full max-w-lg"
          >
            <NeoCard className="bg-[#A3E635] border-[8px] border-black shadow-[15px_15px_0px_0px_black] p-12 text-center">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="bg-white w-24 h-24 border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_black]"
              >
                <PartyPopper size={48} className="text-black" />
              </motion.div>
              
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                GREAT!
              </h2>
              <p className="text-2xl font-black uppercase tracking-tighter text-black/70">
                Let's Sign You Up
              </p>
              
              <div className="mt-10 flex justify-center">
                <div className="flex gap-2">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 bg-black" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-4 h-4 bg-black" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-4 h-4 bg-black" 
                  />
                </div>
              </div>
            </NeoCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetupOnboarding;