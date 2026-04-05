
export type Category = string;

export const DEFAULT_CATEGORIES = {
  FULL_STACK: 'Full Stack',
  UI_UX: 'UI/UX',
  DESIGN: 'Design',
  GAME_DEV: 'Game Dev',
  AI_ML: 'AI/ML',
  TOOLS: 'Tools & Productivity',
  SCREENSHOTS: 'Screenshots',
  NOTES: 'Notes',
  OTHER: 'Other'
};

export const CATEGORY_LIST = Object.values(DEFAULT_CATEGORIES);

export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  PERPLEXITY = 'perplexity',
  OTHERS = 'others'
}

export interface ContentItem {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  category: Category;
  isChecked: boolean;
  dateAdded: number;
  lastInteracted: number; // For Streak Strike decay
  imageUrl?: string;
  contentBody?: string;
  attachmentUrl?: string;
}

export interface SemanticConnection {
  fromId: string;
  toId: string;
  type: 'RELATED' | 'CONTRADICTS' | 'PREREQUISITE' | 'INSPIRED';
  reason: string;
}

export type RecentActivityEntry =
  | { type: 'ITEM'; data: ContentItem }
  | { type: 'CATEGORY'; data: Category };

export type ViewState = 'HOME' | 'PROJECTS' | 'ABOUT_US' | 'AUTH' | 'BRAIN_WEB';

export const CATEGORY_COLORS: Record<string, string> = {
  [DEFAULT_CATEGORIES.FULL_STACK]: 'bg-yellow-400',
  [DEFAULT_CATEGORIES.UI_UX]: 'bg-purple-400',
  [DEFAULT_CATEGORIES.DESIGN]: 'bg-pink-400',
  [DEFAULT_CATEGORIES.GAME_DEV]: 'bg-orange-400',
  [DEFAULT_CATEGORIES.AI_ML]: 'bg-lime-400',
  [DEFAULT_CATEGORIES.TOOLS]: 'bg-cyan-400',
  [DEFAULT_CATEGORIES.SCREENSHOTS]: 'bg-orange-500',
  [DEFAULT_CATEGORIES.NOTES]: 'bg-green-400',
  [DEFAULT_CATEGORIES.OTHER]: 'bg-gray-300'
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || 'bg-gray-200';
};
