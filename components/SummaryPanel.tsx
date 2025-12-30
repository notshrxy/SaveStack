import React, { useState, useEffect, useRef } from 'react';
import { X, Brain, MessageSquare, ChevronRight, Loader2, Send, Sparkles, FileText, Globe, Info, Zap } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import { ContentItem, CATEGORY_COLORS } from '../types';
import { getEducationalSummary, createProjectChat, stripMarkdown } from '../services/aiService';
import { Chat } from '@google/genai';

interface SummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  onAIError?: (err: any) => void;
}

const SaveStackGenie: React.FC<SummaryPanelProps> = ({ isOpen, onClose, items, onAIError }) => {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Optimistic key check
    const checkKey = async () => {
      const k = await localStorage.getItem('SAVESTACK_USER_API_KEY');
      setHasPersonalKey(!!k);
    };
    if (isOpen) checkKey();
  }, [isOpen]);

  const handleSelectItem = async (item: ContentItem) => {
    setSelectedItem(item);
    setIsLoading(true);
    setSummary(null);
    setMessages([]);
    
    try {
      const eduSummary = await getEducationalSummary(item);
      setSummary(eduSummary);
      const session = await createProjectChat(item);
      setChatSession(session);
    } catch (err) {
      console.error(err);
      onAIError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || !chatSession || isSending) return;

    const userText = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsSending(true);

    try {
      const response = await chatSession.sendMessage({ message: userText });
      const modelText = response.text ? stripMarkdown(response.text) : "I'm not sure how to answer that based on this content.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (err) {
      console.error(err);
      onAIError?.(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost my train of thought. Can you try again?" }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md overflow-hidden">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 bg-white border-4 border-black rounded-none hover:bg-red-400 hover:rotate-90 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-[110]"
      >
        <X size={32} strokeWidth={3} />
      </button>

      {!selectedItem ? (
        <NeoCard className="w-full max-w-2xl bg-white rounded-none p-10 transform scale-100 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-yellow-400 p-3 border-4 border-black rounded-none">
                <Brain size={48} />
            </div>
            <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">SaveStack Genie</h2>
                <p className="font-bold text-gray-500">Ready to explore? Pick a project</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
            {items.length === 0 ? (
              <p className="font-bold text-gray-400 italic py-10 text-center">Oh oh! Seems like your stash is empty.</p>
            ) : (
              <div className="grid gap-4">
                {items.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="group bg-white border-4 border-black p-5 rounded-none flex justify-between items-center text-left hover:bg-purple-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_rgba(163,230,0,1)] transition-all"
                  >
                    <div>
                      <div className="text-xs font-black uppercase text-purple-600 mb-1">{item.category}</div>
                      <div className="font-black text-xl leading-tight">{item.title}</div>
                    </div>
                    <ChevronRight size={24} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </NeoCard>
      ) : (
        <div className="w-full h-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col h-full animate-in slide-in-from-left duration-500">
             <NeoCard className="flex-grow bg-white rounded-none p-8 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
                    <div className="flex items-center gap-3">
                        <FileText size={24} className="text-blue-500" />
                        <h3 className="text-2xl font-black uppercase tracking-tight">Project Content</h3>
                    </div>
                    <span className={`px-4 py-1 border-2 border-black rounded-none font-black text-xs uppercase ${CATEGORY_COLORS[selectedItem.category]}`}>
                        {selectedItem.category}
                    </span>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar space-y-6">
                    <h1 className="text-4xl font-black uppercase leading-[1]">{selectedItem.title}</h1>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
                        <Globe size={14} /> {selectedItem.source}
                    </div>
                    <div className="prose prose-lg max-w-none">
                        {selectedItem.contentBody ? (
                            <div className="font-medium whitespace-pre-wrap leading-relaxed text-gray-800">
                                {selectedItem.contentBody}
                            </div>
                        ) : (
                            <div className="bg-gray-50 border-4 border-black p-6 rounded-none italic font-bold text-gray-400">
                                <p className="not-italic text-black opacity-100">"{selectedItem.summary}"</p>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="mt-6 font-black uppercase text-xs flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                  <ChevronRight size={14} className="rotate-180" /> Change Project
                </button>
             </NeoCard>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            <div className="flex-grow basis-0 flex flex-col animate-in slide-in-from-right duration-500 min-h-0">
                <NeoCard color="bg-yellow-100" className="flex-grow rounded-none p-8 overflow-hidden flex flex-col h-full relative">
                    <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4 flex-shrink-0">
                        <Sparkles size={24} className="text-orange-500" />
                        <h3 className="text-2xl font-black uppercase tracking-tight">Genie Analysis</h3>
                    </div>
                    <div className="flex-grow overflow-y-auto no-scrollbar pr-2">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-10">
                                <Loader2 className="animate-spin text-purple-600" size={48} strokeWidth={3} />
                                <p className="font-black uppercase text-center animate-pulse tracking-widest text-sm">Neural Link Active...</p>
                            </div>
                        ) : (
                            <div className="font-medium leading-relaxed whitespace-pre-wrap text-lg pb-4">
                                {summary}
                            </div>
                        )}
                    </div>
                </NeoCard>
            </div>
            <div className="animate-in slide-in-from-bottom duration-500 flex-shrink-0">
                <NeoCard className="bg-white rounded-none p-6 shadow-[10px_10px_0px_0px_rgba(176,136,255,1)]">
                    <div className="mb-4 max-h-[180px] overflow-y-auto no-scrollbar space-y-3 px-2">
                        {messages.length === 0 ? (
                            <div className="flex items-center gap-3 text-gray-400 py-2">
                                <Info size={16} />
                                <p className="text-xs font-black uppercase tracking-wider">Ask me anything about this stash.</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] p-3 border-4 border-black rounded-none font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-blue-100' : 'bg-white'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type a question..." className="flex-grow p-4 border-4 border-black rounded-none font-black text-sm focus:outline-none focus:bg-yellow-50 transition-colors bg-[#FAF5E9]" />
                        <button type="submit" disabled={isSending || isLoading} className="bg-black text-white p-4 rounded-none border-4 border-black hover:bg-purple-600 transition-all disabled:opacity-30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Send size={24} /></button>
                    </form>
                </NeoCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveStackGenie;