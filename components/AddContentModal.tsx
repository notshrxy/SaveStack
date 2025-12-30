import React, { useState, useRef } from 'react';
import { X, Loader2, Link as LinkIcon, Type, Image as ImageIcon, FileText, Upload, Sparkles, ZapOff, BrainCircuit } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import { analyzeContent, analyzeImage } from '../services/geminiService';
import { ContentItem, Category } from '../types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ContentItem) => void;
  isAIOffline?: boolean;
  onTriggerAIOnboarding?: () => void;
}

type Mode = 'link' | 'text' | 'screenshot' | 'note';

const AddContentModal: React.FC<AddContentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isAIOffline = false,
  onTriggerAIOnboarding 
}) => {
  const [input, setInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [mode, setMode] = useState<Mode>('link');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setInput('');
    setNoteTitle('');
    setNoteBody('');
    setImageUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsProcessing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        if (!isAIOffline) {
          triggerImageAnalysis(reader.result as string, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageAnalysis = async (base64Data: string, mimeType: string) => {
    setIsAnalyzingImage(true);
    try {
      const base64 = base64Data.split(',')[1];
      const result = await analyzeImage(base64, mimeType);
      
      setNoteTitle(result.title);
      setInput(result.summary);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSaveFlow = async (isManual: boolean = false) => {
    // If AI is required but user clicked the AI button, trigger onboarding
    if (!isManual && isAIOffline && mode !== 'note') {
      onTriggerAIOnboarding?.();
      return;
    }

    setIsProcessing(true);

    try {
      let newItem: ContentItem;

      if (mode === 'link' || mode === 'text') {
        if (!input.trim()) {
          setIsProcessing(false);
          return;
        }
        
        if (isManual || isAIOffline) {
          // Manual fallback for link/text
          const urlObj = mode === 'link' ? new URL(input.startsWith('http') ? input : `https://${input}`) : null;
          newItem = {
            id: Date.now().toString(),
            title: mode === 'link' ? (urlObj?.hostname.replace('www.', '') || 'Saved Link') : (input.substring(0, 30) + (input.length > 30 ? '...' : '')),
            source: mode === 'link' ? (urlObj?.hostname.replace('www.', '') || 'Web') : 'Manual Snippet',
            url: mode === 'link' ? input : '#',
            summary: mode === 'link' ? `Manually saved link to ${input}` : input.substring(0, 100),
            category: Category.OTHER,
            isChecked: false,
            dateAdded: Date.now(),
            lastInteracted: Date.now()
          };
        } else {
          // AI Analysis Flow
          const aiResult = await analyzeContent(input);
          newItem = {
            id: Date.now().toString(),
            title: aiResult.title,
            source: mode === 'link' ? new URL(input).hostname.replace('www.', '') : 'Text Snippet',
            url: mode === 'link' ? input : '#',
            summary: aiResult.summary,
            category: aiResult.category as Category,
            isChecked: false,
            dateAdded: Date.now(),
            lastInteracted: Date.now()
          };
        }
      } else if (mode === 'screenshot') {
        newItem = {
          id: Date.now().toString(),
          title: noteTitle || "Captured Visual",
          source: 'User Upload',
          url: '#',
          imageUrl: previewUrl || imageUrl || '#',
          summary: input || "User-saved screenshot.",
          category: Category.SCREENSHOTS,
          isChecked: false,
          dateAdded: Date.now(),
          lastInteracted: Date.now()
        };
      } else { // mode === 'note'
        newItem = {
          id: Date.now().toString(),
          title: noteTitle || "Untitled Note",
          source: 'Personal Note',
          url: '#',
          summary: noteBody.substring(0, 100) + (noteBody.length > 100 ? '...' : ''),
          contentBody: noteBody,
          category: Category.NOTES,
          isChecked: false,
          dateAdded: Date.now(),
          lastInteracted: Date.now()
        };
      }

      onSave(newItem);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to process", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveFlow(false);
  };

  const tabs: { id: Mode, label: string, icon: any }[] = [
    { id: 'link', label: 'Link', icon: LinkIcon },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'screenshot', label: 'Shot', icon: ImageIcon },
    { id: 'note', label: 'Note', icon: FileText },
  ];

  const showAIDualOptions = isAIOffline && mode !== 'note';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <NeoCard className="w-full max-w-lg relative" color="bg-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all rounded-full z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Add to Brain</h2>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b-4 border-black overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setMode(tab.id); resetForm(); }}
                className={`flex-1 min-w-[80px] py-3 font-bold uppercase flex justify-center items-center gap-2 transition-colors ${mode === tab.id ? 'bg-purple-400 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <tab.icon size={16} /> <span className="text-xs md:text-sm">{tab.label}</span>
              </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'link' && (
            <div>
              <label className="block font-bold text-sm uppercase mb-2">Paste URL</label>
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full p-4 font-medium border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 transition-shadow"
                autoFocus
              />
            </div>
          )}

          {mode === 'text' && (
            <div>
              <label className="block font-bold text-sm uppercase mb-2">Paste Content</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste notes, raw text, or ideas here..."
                rows={4}
                className="w-full p-4 font-medium border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 transition-shadow"
              />
            </div>
          )}

          {mode === 'screenshot' && (
            <div className="space-y-4">
              <div 
                className={`w-full h-40 border-4 border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors relative overflow-hidden ${previewUrl ? 'border-solid' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Upload size={32} className="mb-2" />
                    <span className="font-black uppercase text-sm">Upload Screenshot</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-yellow-400 border-2 border-black px-4 py-2 font-black flex items-center gap-2 animate-bounce">
                      <Sparkles size={18} /> ANALYZING...
                    </div>
                  </div>
                )}
                
                {isAIOffline && previewUrl && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ZapOff size={12} /> AI Unavailable
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-sm uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder={isAIOffline ? "Enter title manually..." : "AI will generate this..."}
                  className="w-full p-3 font-medium border-4 border-black focus:outline-none bg-yellow-50"
                />
              </div>

              <div>
                <label className="block font-bold text-sm uppercase mb-1">Summary / Notes</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAIOffline ? "Enter notes manually..." : "AI will summarize the visual context..."}
                  rows={2}
                  className="w-full p-3 font-medium border-4 border-black focus:outline-none bg-yellow-50 text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'note' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm uppercase mb-2">Note Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Meeting Notes, Reminder..."
                  className="w-full p-3 font-medium border-4 border-black focus:outline-none bg-yellow-50"
                />
              </div>
              <div>
                <label className="block font-bold text-sm uppercase mb-2">Content</label>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Detailed professional documentation or simple notes..."
                  rows={5}
                  className="w-full p-3 font-medium border-4 border-black focus:outline-none bg-yellow-50"
                />
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {!showAIDualOptions ? (
              <NeoButton 
                type="submit" 
                fullWidth 
                disabled={isProcessing || isAnalyzingImage}
                variant="primary"
                className="py-5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  'Save to Brain'
                )}
              </NeoButton>
            ) : (
              <>
                <NeoButton 
                  type="button"
                  fullWidth 
                  onClick={() => onTriggerAIOnboarding?.()}
                  variant="primary"
                  className="!bg-black !text-white py-5 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]"
                >
                  <BrainCircuit size={20} className="text-[#A3E635]" /> SAVE SMARTER WITH AI
                </NeoButton>
                
                <NeoButton 
                  type="button"
                  fullWidth 
                  onClick={() => handleSaveFlow(true)}
                  disabled={isProcessing}
                  variant="secondary"
                  className="py-4 border-dashed"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'SAVE MANUALLY'}
                </NeoButton>
              </>
            )}
          </div>
          
          {isAIOffline && mode !== 'note' && (
            <p className="text-[10px] font-black uppercase text-center text-red-500 flex items-center justify-center gap-1 opacity-60">
              <ZapOff size={12} /> Neural Link required for automated content processing.
            </p>
          )}
        </form>
      </NeoCard>
    </div>
  );
};

export default AddContentModal;