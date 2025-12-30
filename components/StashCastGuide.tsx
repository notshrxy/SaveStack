import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';

interface StashCastGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const StashCastGuide: React.FC<StashCastGuideProps> = ({ isOpen, onClose }) => {
  const imageSrc = "https://i.postimg.cc/BnLZP9GT/Stash-Cast.jpg";
  const cassetteSrc = "https://i.postimg.cc/ncLSknrY/Casette.jpg";
  const speakerSrc = "https://i.postimg.cc/65Qb0BqV/Speaker.jpg";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="relative w-full max-w-5xl"
      >
        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,139,139,1)] overflow-hidden">
          {/* Header - Turquoise Color Theme */}
          <div className="bg-[#005F73] text-white p-4 flex justify-between items-center border-b-[8px] border-black">
            <h2 className="font-jersey text-4xl uppercase tracking-widest flex items-center gap-4">
              <span className="bg-[#A3E635] text-black px-3 py-1 text-2xl">Manual</span>
              <span>Meet StashCast</span>
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
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={imageSrc} 
                alt="StashCast Guide"
                className="max-w-full max-h-full object-contain pointer-events-none select-none border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

          {/* Footer Area - Turquoise Color Theme */}
          <div className="bg-gray-100 border-t-[8px] border-black p-6 flex justify-end items-center">
            <div className="flex gap-4">
              <NeoButton 
                size="sm" 
                onClick={onClose} 
                className="px-12 !bg-[#005F73] !text-white !border-black"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
              >
                Got it! <Check size={18} strokeWidth={3} className="ml-2" />
              </NeoButton>
            </div>
          </div>
        </NeoCard>

        {/* Thematic Decorative Images in Bottom Left */}
        <div className="absolute bottom-12 -left-8 flex items-end gap-3 z-[410] hidden md:flex pointer-events-none">
          {/* Cassette Image */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-6deg] w-28 overflow-hidden transform hover:scale-110 transition-transform">
            <img 
              src={cassetteSrc} 
              alt="Vintage Cassette" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
          
          {/* Speaker Image */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[4deg] w-24 overflow-hidden -mb-4 ml-[-12px] transform hover:scale-110 transition-transform">
            <img 
              src={speakerSrc} 
              alt="Retro Speaker" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StashCastGuide;