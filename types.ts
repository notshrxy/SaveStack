
export enum Category {
  FULL_STACK = 'Full Stack',
  UI_UX = 'UI/UX',
  DESIGN = 'Design',
  GAME_DEV = 'Game Dev',
  AI_ML = 'AI/ML',
  TOOLS = 'Tools & Productivity',
  SCREENSHOTS = 'Screenshots',
  NOTES = 'Notes',
  OTHER = 'Other'
}

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

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FULL_STACK]: 'bg-yellow-400',
  [Category.UI_UX]: 'bg-purple-400',
  [Category.DESIGN]: 'bg-pink-400',
  [Category.GAME_DEV]: 'bg-orange-400',
  [Category.AI_ML]: 'bg-lime-400',
  [Category.TOOLS]: 'bg-cyan-400',
  [Category.SCREENSHOTS]: 'bg-orange-500',
  [Category.NOTES]: 'bg-green-400',
  [Category.OTHER]: 'bg-gray-300'
};
