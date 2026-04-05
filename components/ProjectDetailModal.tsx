
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Eye, EyeOff, Link as LinkIcon, Image as ImageIcon, FileText, Type, ChevronDown, Plus, Check } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import { ContentItem, CATEGORY_LIST, getCategoryColor } from '../types';

interface ProjectDetailModalProps {
    item: ContentItem | null;
    onClose: () => void;
    onUpdateItem?: (id: string, updates: Partial<ContentItem>) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ item, onClose, onUpdateItem }) => {
    const [showSecret, setShowSecret] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!item) return null;

    const handleCategoryChange = (category: string) => {
        onUpdateItem?.(item.id, { category });
        setIsCategoryOpen(false);
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            handleCategoryChange(newCategory.trim());
            setNewCategory('');
        }
    };

    const isLink = item.url && item.url !== '#' && !item.imageUrl && !item.contentBody;
    const isShot = !!item.imageUrl && item.imageUrl !== '#';
    const isNote = !!item.contentBody;
    const isText = !isLink && !isShot && !isNote;

    return (
        <AnimatePresence>
            {item && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-4 -right-4 p-2 bg-white border-4 border-black rounded-none hover:bg-red-400 hover:rotate-90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[310]"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>

                        <NeoCard className="bg-white p-8 md:p-12 border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh] no-scrollbar">
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className={`group flex items-center gap-1 px-3 py-1 border-2 border-black font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${getCategoryColor(item.category)}`}
                                        >
                                            {item.category}
                                            <ChevronDown size={12} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isCategoryOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 mt-2 w-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[400] overflow-hidden"
                                                >
                                                    <div className="max-h-60 overflow-y-auto no-scrollbar p-2 space-y-1">
                                                        {CATEGORY_LIST.map(cat => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => handleCategoryChange(cat)}
                                                                className={`w-full text-left px-3 py-2 font-black text-[10px] uppercase tracking-widest border-2 border-transparent hover:border-black hover:bg-gray-100 flex items-center justify-between ${item.category === cat ? 'bg-gray-100 border-black' : ''}`}
                                                            >
                                                                {cat}
                                                                {item.category === cat && <Check size={12} />}
                                                            </button>
                                                        ))}

                                                        {/* Custom Categories if any (not in CATEGORY_LIST) */}
                                                        {!CATEGORY_LIST.includes(item.category) && (
                                                            <button
                                                                onClick={() => handleCategoryChange(item.category)}
                                                                className="w-full text-left px-3 py-2 font-black text-[10px] uppercase tracking-widest border-2 border-black bg-gray-100 flex items-center justify-between"
                                                            >
                                                                {item.category}
                                                                <Check size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="p-2 border-t-4 border-black bg-yellow-50">
                                                        <form onSubmit={handleCreateCategory} className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                value={newCategory}
                                                                onChange={(e) => setNewCategory(e.target.value)}
                                                                placeholder="NEW CATEGORY..."
                                                                className="flex-1 px-2 py-1 border-2 border-black font-black text-[10px] uppercase focus:outline-none bg-white"
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="p-1 bg-black text-white border-2 border-black hover:bg-purple-600 transition-colors"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                            Source: {item.source}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] tracking-tighter">
                                        {item.title}
                                    </h2>
                                </div>

                                {/* Content Section */}
                                <div className="space-y-6">
                                    {/* Action Button */}
                                    {(isLink || isShot || isText) && (
                                        <NeoButton
                                            onClick={() => setShowSecret(!showSecret)}
                                            variant="secondary"
                                            fullWidth
                                            className="py-4 border-4 border-black bg-yellow-300 hover:bg-yellow-200"
                                        >
                                            {isLink ? (
                                                <>
                                                    {showSecret ? <EyeOff size={20} className="mr-2" /> : <Eye size={20} className="mr-2" />}
                                                    {showSecret ? 'Hide the Link' : 'Show the Link'}
                                                </>
                                            ) : isShot ? (
                                                <>
                                                    {showSecret ? <EyeOff size={20} className="mr-2" /> : <Eye size={20} className="mr-2" />}
                                                    {showSecret ? 'Hide the Image' : 'View the Image'}
                                                </>
                                            ) : (
                                                <>
                                                    {showSecret ? <EyeOff size={20} className="mr-2" /> : <Eye size={20} className="mr-2" />}
                                                    {showSecret ? 'Hide the Text' : 'View the Text'}
                                                </>
                                            )}
                                        </NeoButton>
                                    )}

                                    {/* Secret Content */}
                                    <AnimatePresence>
                                        {showSecret && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                {isLink && (
                                                    <div className="p-4 bg-blue-50 border-4 border-black font-mono text-sm break-all flex items-center justify-between gap-4">
                                                        <span>{item.url}</span>
                                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 bg-black text-white hover:bg-purple-600 transition-colors">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>
                                                )}
                                                {isShot && (
                                                    <div className="border-4 border-black overflow-hidden bg-gray-100">
                                                        <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-contain max-h-[400px]" referrerPolicy="no-referrer" />
                                                    </div>
                                                )}
                                                {(isNote || isText) && item.contentBody && (
                                                    <div className="p-6 bg-purple-50 border-4 border-black font-medium text-base whitespace-pre-wrap">
                                                        {item.contentBody}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Summary / Notes */}
                                    <div className="space-y-4">
                                        <h4 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                            <FileText size={16} /> Summary / Notes
                                        </h4>
                                        <div className="p-6 bg-gray-50 border-4 border-black font-bold text-lg leading-tight relative">
                                            <div className="absolute -top-3 -left-3 bg-black text-white p-1">
                                                <Type size={12} />
                                            </div>
                                            <p className="text-gray-800 italic">"{isNote ? (item.contentBody || item.summary) : item.summary}"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                                    <span>Added: {new Date(item.dateAdded).toLocaleDateString()}</span>
                                    <span>ID: {item.id}</span>
                                </div>
                            </div>
                        </NeoCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProjectDetailModal;
