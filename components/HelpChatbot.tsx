import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2, Minus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createHelpChat, stripMarkdown } from '../services/aiService';
import { Chat } from '@google/genai';
import NeoCard from './ui/NeoCard';

interface HelpChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onAIError?: (err: any) => void;
}

const HelpChatbot: React.FC<HelpChatbotProps> = ({ isOpen, onClose, onAIError }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Yo! I'm the SaveStack Guide. Need help navigating your brain? Ask away! 🧠" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (isOpen && !chatSession) {
        try {
          const session = await createHelpChat();
          setChatSession(session);
        } catch (err) {
          onAIError?.(err);
        }
      }
    };
    initChat();
  }, [isOpen]);

  // Handle the visibility of the "IM HERE" pop-up with a 3-second timeout
  useEffect(() => {
    let timer: number;
    if (isMinimized) {
      setShowPopUp(true);
      timer = window.setTimeout(() => {
        setShowPopUp(false);
      }, 3000);
    } else {
      setShowPopUp(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      const responseText = response.text ? stripMarkdown(response.text) : "My brain short-circuited. Try again?";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      onAIError?.(error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection lost. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[120] pointer-events-none">
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }} 
            className="pointer-events-auto"
          >
            <NeoCard className="w-80 md:w-96 bg-white p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
              <div className="bg-[#A3E635] border-b-4 border-black p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <span className="font-black uppercase text-xs tracking-widest">SaveStack Guide</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-black/10 transition-colors"><Minus size={18} /></button>
                  <button onClick={onClose} className="p-1 hover:bg-red-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>
              </div>
              <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-[#FAF5E9] no-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 border-2 border-black font-bold text-xs shadow-[3px_3px_0px_black] ${msg.role === 'user' ? 'bg-[#B088FF] text-white' : 'bg-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-2 border-2 border-black flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSend} className="p-3 border-t-4 border-black bg-white flex gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ask the Guide..." 
                  className="flex-grow bg-[#FAF5E9] border-2 border-black p-2 font-bold text-xs outline-none focus:bg-white transition-colors" 
                />
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-black text-white p-2 border-2 border-black hover:bg-[#A3E635] hover:text-black transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </NeoCard>
          </motion.div>
        ) : (
          <div className="relative pointer-events-auto flex flex-col items-end gap-3">
            {/* "IM HERE IF YOU NEED ME!" Pop-up with AnimatePresence for exit animation */}
            <AnimatePresence>
              {showPopUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 20, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 20, y: 20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25,
                    delay: 0.1
                  }}
                  className="mb-1"
                >
                  <div className="relative bg-[#A3E635] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black] rotate-[-2deg]">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-black" strokeWidth={3} />
                      <span className="font-black text-[10px] md:text-xs uppercase tracking-tighter whitespace-nowrap">
                        IM HERE IF YOU NEED ME!
                      </span>
                    </div>
                    {/* Speech Bubble Tail */}
                    <div className="absolute -bottom-3 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[12px] border-t-black border-r-[10px] border-r-transparent"></div>
                    <div className="absolute -bottom-[6px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-[#A3E635] border-r-[8px] border-r-transparent z-10"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              layoutId="chat-toggle" 
              onClick={() => setIsMinimized(false)} 
              className="bg-[#A3E635] border-4 border-black p-4 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
            >
              <MessageCircle size={28} className="group-hover:scale-110 transition-transform" strokeWidth={3} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpChatbot;