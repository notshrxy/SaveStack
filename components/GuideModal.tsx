import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(1);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    setPage(2);
    setHasError(false);
  };
  
  const handlePrev = () => {
    setPage(1);
    setHasError(false);
  };

  // Using the provided external hotlink for page 1 and keeping page 2 as local for now
  const imageSrc = page === 1 
    ? "https://i.postimg.cc/FzwtdXBZ/guide_1.jpg" 
    : "https://i.postimg.cc/nhpxvpL3/guide-2.jpg";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotate: -1 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotate: 1 }}
        className="relative w-full max-w-5xl"
      >
        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(253,224,71,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center border-b-[8px] border-black">
            <h2 className="font-jersey text-4xl uppercase tracking-widest flex items-center gap-4">
              <span className="bg-[#B088FF] text-black px-3 py-1 text-2xl">Manual</span>
              <span>Page {page} of 2</span>
            </h2>
            <button 
              onClick={onClose} 
              className="bg-red-500 p-2 border-4 border-white hover:rotate-90 transition-transform active:scale-90"
            >
              <X size={24} strokeWidth={4} />
            </button>
          </div>

          {/* Image Container */}
          <div className="relative h-[60vh] md:h-[75vh] bg-white flex items-center justify-center p-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                {!hasError ? (
                  <img 
                    src={imageSrc} 
                    alt={`Manual Page ${page}`}
                    className="max-w-full max-h-full object-contain pointer-events-none select-none border-2 border-black/5"
                    onLoad={() => console.log(`Successfully loaded: ${imageSrc}`)}
                    onError={() => {
                      console.error(`Failed to load: ${imageSrc}`);
                      setHasError(true);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 border-4 border-dashed border-black/10">
                    <div className="bg-yellow-200 p-6 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <ImageIcon size={64} className="text-black" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Guide Image Missing</h3>
                    <p className="font-bold text-gray-400 max-w-sm">
                      We're looking for <code className="bg-gray-100 px-2 text-black">{imageSrc}</code>. 
                      Ensure the assets are accessible or uploaded to the project root.
                    </p>
                    <NeoButton size="sm" onClick={() => setHasError(false)} variant="secondary" className="mt-4">
                      Try Again
                    </NeoButton>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="bg-gray-100 border-t-[8px] border-black p-6 flex justify-between items-center">
            <div className="flex gap-3">
              <div className={`w-4 h-4 border-2 border-black transition-colors ${page === 1 ? 'bg-black' : 'bg-white'}`} />
              <div className={`w-4 h-4 border-2 border-black transition-colors ${page === 2 ? 'bg-black' : 'bg-white'}`} />
            </div>

            <div className="flex gap-4">
              {page === 2 && (
                <NeoButton size="sm" onClick={handlePrev} variant="secondary" className="px-6">
                  <ArrowLeft size={18} strokeWidth={3} /> Back
                </NeoButton>
              )}
              
              {page === 1 ? (
                <NeoButton size="sm" onClick={handleNext} className="px-8">
                  Next Step <ArrowRight size={18} strokeWidth={3} />
                </NeoButton>
              ) : (
                <NeoButton 
                  size="sm" 
                  onClick={onClose} 
                  className="px-8 !bg-[#A3E635] !text-black"
                >
                  Got it! <Check size={18} strokeWidth={3} />
                </NeoButton>
              )}
            </div>
          </div>
        </NeoCard>
      </motion.div>
    </div>
  );
};

export default GuideModal;