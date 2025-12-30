import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';

interface AntiHoardGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const AntiHoardGuide: React.FC<AntiHoardGuideProps> = ({ isOpen, onClose }) => {
  const mainImage = "https://i.postimg.cc/43SZPWQX/Streaks.jpg";
  const fireIcon = "https://i.postimg.cc/wBGH2wcS/fire_emoji.jpg";
  const progressBar = "https://i.postimg.cc/FKBmpTVv/progress_bar.jpg";

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
        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(163,230,53,1)] overflow-hidden">
          {/* Header - Lime Color Theme */}
          <div className="bg-[#A3E635] text-black p-4 flex justify-between items-center border-b-[8px] border-black">
            <h2 className="font-jersey text-4xl uppercase tracking-widest flex items-center gap-4">
              <span className="bg-black text-white px-3 py-1 text-2xl">Manual</span>
              <span>Momentum, Made Visible</span>
            </h2>
            <button 
              onClick={onClose} 
              className="bg-red-500 p-2 border-4 border-black hover:rotate-90 transition-transform active:scale-90"
            >
              <X size={24} strokeWidth={4} color="white" />
            </button>
          </div>

          {/* Image Container */}
          <div className="relative h-[60vh] md:h-[75vh] bg-white flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={mainImage} 
                alt="Anti-Hoard Guide"
                className="max-w-full max-h-full object-contain pointer-events-none select-none border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

          {/* Footer Area - Lime Color Theme */}
          <div className="bg-gray-100 border-t-[8px] border-black p-6 flex justify-end items-center">
            <div className="flex gap-4">
              <NeoButton 
                size="sm" 
                onClick={onClose} 
                className="px-12 !bg-black !text-white !border-black"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
              >
                Got it! <Check size={18} strokeWidth={3} className="ml-2" />
              </NeoButton>
            </div>
          </div>
        </NeoCard>

        {/* Thematic Decorative Images in Bottom Left */}
        <div className="absolute bottom-12 -left-8 flex items-end gap-3 z-[410] hidden md:flex pointer-events-none">
          {/* Fire Icon */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-8deg] w-24 overflow-hidden transform hover:scale-110 transition-transform">
            <img 
              src={fireIcon} 
              alt="Fire Emoji" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
          
          {/* Progress Bar Image */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[5deg] w-32 overflow-hidden -mb-4 ml-[-12px] transform hover:scale-110 transition-transform">
            <img 
              src={progressBar} 
              alt="Progress Bar" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AntiHoardGuide;