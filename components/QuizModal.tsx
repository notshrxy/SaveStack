
// DO NOT add any new files, classes, or namespaces.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, BrainCircuit, Check, AlertCircle } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import { ContentItem } from '../types';
import { generateQuiz, QuizData } from '../services/geminiService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  // DO define onAIError prop to match the usage in App.tsx.
  onAIError?: (err: any) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, items, onAIError }) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [targetItem, setTargetItem] = useState<ContentItem | null>(null);

  const startNewQuiz = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setQuiz(null);
    setSelectedIdx(null);
    
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setTargetItem(randomItem);
    
    try {
      const data = await generateQuiz(randomItem);
      setQuiz(data);
    } catch (err) {
      console.error(err);
      // DO notify parent of AI errors to handle re-validation.
      onAIError?.(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) startNewQuiz();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl"
      >
        <NeoCard className="bg-white p-8 relative overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 border-2 border-black transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-400 border-4 border-black">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Brain Blast</h2>
              <p className="font-bold text-gray-500">Test your stash knowledge</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-purple-600" size={48} />
              <p className="font-black uppercase tracking-widest animate-pulse">Generating Challenge...</p>
            </div>
          ) : quiz ? (
            <div className="space-y-6">
              <div className="bg-[#FAF5E9] border-4 border-black p-6">
                <p className="font-black text-xs uppercase text-blue-600 mb-2">Quiz Context: {targetItem?.title}</p>
                <p className="text-xl font-bold leading-tight">{quiz.question}</p>
              </div>

              <div className="space-y-3">
                {quiz.options.map((option, idx) => {
                  const isCorrect = idx === quiz.correctIndex;
                  const isSelected = idx === selectedIdx;
                  
                  let buttonStyle = "bg-white border-4 border-black";
                  if (selectedIdx !== null) {
                    if (isCorrect) buttonStyle = "bg-lime-400 border-black";
                    else if (isSelected) buttonStyle = "bg-red-400 border-black";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedIdx !== null}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full p-4 text-left font-bold text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${buttonStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedIdx !== null && isCorrect && <Check size={24} strokeWidth={3} />}
                        {selectedIdx !== null && isSelected && !isCorrect && <AlertCircle size={24} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedIdx !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t-4 border-black"
                  >
                    <p className="font-black text-xs uppercase mb-1">Genie Explanation:</p>
                    <p className="font-medium mb-6">"{quiz.explanation}"</p>
                    <NeoButton fullWidth onClick={startNewQuiz}>
                      <Sparkles size={20} /> Next Challenge
                    </NeoButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="font-bold text-gray-500">Failed to load quiz. Try again?</p>
              <NeoButton onClick={startNewQuiz} className="mt-4">Retry</NeoButton>
            </div>
          )}
        </NeoCard>
      </motion.div>
    </div>
  );
};

export default QuizModal;