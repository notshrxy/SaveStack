import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';

interface SemanticWebGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const SemanticWebGuide: React.FC<SemanticWebGuideProps> = ({ isOpen, onClose }) => {
  const mainImage = "https://i.postimg.cc/FzZJYt0Q/Brain_Web.jpg";
  const brainIcon = "https://i.postimg.cc/zvjRymTm/Brain.jpg";
  const webIcon = "https://i.postimg.cc/J0qBswjC/web.jpg";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 10, rotate: -0.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, y: 10, rotate: 0.5 }}
        className="relative w-full max-w-5xl"
      >
        <NeoCard className="bg-white p-0 border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(251,146,60,1)] overflow-hidden">
          {/* Header - Orange Color Theme */}
          <div className="bg-orange-400 text-black p-4 flex justify-between items-center border-b-[8px] border-black">
            <div className="flex items-center gap-4">
              <span className="bg-black text-white px-3 py-1 font-jersey text-2xl uppercase tracking-widest">Manual</span>
              <h2 className="font-jersey text-4xl uppercase tracking-widest">Tangled and Intertwined</h2>
            </div>
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
                alt="Semantic Web Guide"
                className="max-w-full max-h-full object-contain pointer-events-none select-none border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

          {/* Footer Area */}
          <div className="bg-gray-100 border-t-[8px] border-black p-6 flex justify-end items-center">
            <NeoButton 
              size="sm" 
              onClick={onClose} 
              className="px-12 !bg-black !text-white !border-black"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              Understood connections <Check size={18} strokeWidth={3} className="ml-2" />
            </NeoButton>
          </div>
        </NeoCard>

        {/* Thematic Decorative Images in Bottom Left */}
        <div className="absolute bottom-12 -left-8 flex items-end gap-3 z-[410] hidden md:flex pointer-events-none">
          {/* Brain Icon */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-12deg] w-28 overflow-hidden transform hover:scale-110 transition-transform">
            <img 
              src={brainIcon} 
              alt="Brain Icon" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
          
          {/* Spider Web Icon */}
          <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[8deg] w-24 overflow-hidden -mb-4 ml-[-16px] transform hover:scale-110 transition-transform">
            <img 
              src={webIcon} 
              alt="Spider Web" 
              className="w-full h-auto object-cover border-2 border-black" 
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SemanticWebGuide;