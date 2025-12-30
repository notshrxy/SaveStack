import React, { useState } from 'react';
import { Menu, X, Plus, User, MessageCircle, Pencil, Layers } from 'lucide-react';
import { ViewState } from '../types';
import { NAV_ITEMS } from '../constants';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenAddModal: () => void;
  onOpenGuide: () => void;
  // Added optional className prop
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onChangeView, 
  onOpenAddModal, 
  onOpenGuide,
  className = '' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    // Fixed: Included the passed className in the root div
    <div className={`absolute top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-6 md:pt-8 pointer-events-none ${className}`}>
      
      {/* Decorative Ornaments (Top) */}
      <div className="w-full max-w-5xl relative h-0">
        <div className="absolute -top-6 right-8 flex gap-1 opacity-70">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37" className="drop-shadow-sm">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          ))}
        </div>
      </div>

      <nav className="relative bg-[#111111] text-white rounded-full px-4 md:px-8 py-2 md:py-3 border border-white/10 w-full max-w-5xl pointer-events-auto transition-all duration-500 overflow-hidden shadow-2xl">
        {/* Loading Bar Element (Ping-Pong Indicator) */}
        <div className="absolute bottom-0 h-[3px] bg-[#B088FF] z-20 animate-navbar-ping-pong shadow-[0_0_10px_rgba(176,136,255,0.6)]"></div>

        <div className="flex justify-between items-center relative z-10">
          
          {/* Logo & Branding (Left) */}
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer group" 
            onClick={() => {
              onChangeView('HOME');
              onOpenGuide();
            }}
          >
            <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center group-hover:scale-110 transition-transform -my-1">
              {!logoError ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                  <img 
                    src="https://i.postimg.cc/yxRMqrLn/logo.jpg" 
                    alt="SaveStack Logo" 
                    className="w-full h-full object-contain pointer-events-none block"
                    onError={(e) => {
                      console.warn("Logo failed to load at remote URL, trying fallback.");
                      setLogoError(true);
                    }}
                  />
                </div>
              ) : (
                /* NEO-BRUTALIST STACK FALLBACK */
                <div className="relative w-10 h-10">
                   <div className="absolute inset-0 bg-yellow-400 border-2 border-white translate-x-1.5 translate-y-1.5 shadow-[2px_2px_0px_black] rounded-sm"></div>
                   <div className="absolute inset-0 bg-purple-500 border-2 border-white translate-x-0.5 translate-y-0.5 shadow-[2px_2px_0px_black] rounded-sm"></div>
                   <div className="absolute inset-0 bg-[#A3E635] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_black] rounded-sm">
                      <Layers size={20} className="text-black" strokeWidth={3} />
                   </div>
                </div>
              )}
            </div>
            <span className="font-jersey text-3xl md:text-4xl text-white tracking-normal hidden sm:block">
              SaveStack
            </span>
          </div>

          {/* Desktop Nav Items (Center) */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => onChangeView(item.view as ViewState)}
                className={`
                  relative font-bold text-xs md:text-sm uppercase tracking-[0.2em] transition-all py-2
                  ${currentView === item.view ? 'text-[#B088FF]' : 'text-white/70 hover:text-white'}
                `}
              >
                {item.label}
                {currentView === item.view && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B088FF] shadow-[0_0_8px_rgba(176,136,255,0.8)] rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Actions (Right) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenAddModal} 
              className="bg-[#B088FF] hover:bg-[#9966FF] text-white font-black uppercase text-[10px] md:text-xs px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_5px_15px_rgba(176,136,255,0.4)]"
            >
              <Plus size={16} strokeWidth={3} /> Add
            </button>
            
            <div 
              onClick={() => onChangeView('AUTH')}
              className={`w-10 h-10 md:w-12 md:h-12 border-2 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-105 shadow-lg pointer-events-auto ${currentView === 'AUTH' ? 'bg-[#A3E635] border-white' : 'bg-[#A3E635] border-white/20 hover:bg-[#86efac]'}`}
            >
              <User size={24} className="text-black" strokeWidth={2.5} />
            </div>

            <button 
              className="md:hidden p-1 text-white" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full mt-4 left-0 right-0 bg-[#111111] rounded-[2.5rem] border border-white/10 shadow-2xl p-6 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onChangeView(item.view as ViewState);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  text-left font-bold text-lg uppercase py-3 px-4 rounded-2xl transition-colors
                  ${currentView === item.view ? 'bg-white/10 text-[#B088FF]' : 'text-white/70'}
                `}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => { onOpenAddModal(); setIsMobileMenuOpen(false); }}
              className="bg-[#B088FF] text-white font-black uppercase py-4 rounded-full border border-white/20 shadow-lg mt-2"
            >
              Add Content
            </button>
          </div>
        )}
      </nav>

      {/* Floating Auxiliary Buttons */}
      <div className="w-full max-w-5xl relative flex justify-end gap-4 mt-4 pr-2 pointer-events-none">
        <div className="relative group pointer-events-auto">
          <a 
            href="https://github.com/notshrxy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#F3E5AB] border-2 border-black/80 rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-pointer flex flex-col items-center"
          >
            <MessageCircle size={22} className="text-black group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </a>
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] scale-90 group-hover:scale-100">
            <div className="bg-black text-white border-2 border-white px-4 py-1.5 font-black text-[11px] uppercase tracking-tighter whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(176,136,255,1)]">
              MY GITHUB
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-l-2 border-t-2 border-white rotate-45"></div>
          </div>
        </div>

        <div className="relative group pointer-events-auto">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeFpQc9YuDgvkFcEawhRsd4jmptOXrYyE9HiRWng1DO7li84g/viewform?usp=dialog" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#F3E5AB] border-2 border-black/80 rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-pointer group"
          >
            <Pencil size={22} className="text-black group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          </a>
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] scale-90 group-hover:scale-100">
            <div className="bg-black text-white border-2 border-white px-4 py-1.5 font-black text-[11px] uppercase tracking-tighter whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]">
              LEAVE A FEEDBACK :P
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-l-2 border-t-2 border-white rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;