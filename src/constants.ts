import { Category, ContentItem } from './types';

export const MOCK_ITEMS: ContentItem[] = [
  {
    id: '1',
    title: 'React 18 Concurrency Explained',
    source: 'YouTube',
    url: 'https://youtube.com',
    summary: 'A deep dive into automatic batching and transitions in the new React engine.',
    category: Category.FULL_STACK,
    isChecked: false,
    dateAdded: Date.now() - 10000000,
    // Fix: Added required lastInteracted property
    lastInteracted: Date.now() - 10000000
  },
  {
    id: '2',
    title: '10 Neo-Brutalism Design Trends',
    source: 'Instagram',
    url: 'https://instagram.com',
    summary: 'Visual examples of high contrast borders and loud typography in modern web apps.',
    category: Category.DESIGN,
    isChecked: false,
    dateAdded: Date.now() - 5000000,
    // Fix: Added required lastInteracted property
    lastInteracted: Date.now() - 5000000
  },
  {
    id: '3',
    title: 'Transformers Architecture Paper',
    source: 'Arxiv',
    url: 'https://arxiv.org',
    summary: 'Attention is all you need. The foundational paper for modern LLMs.',
    category: Category.AI_ML,
    isChecked: true,
    dateAdded: Date.now() - 20000000,
    // Fix: Added required lastInteracted property
    lastInteracted: Date.now() - 20000000
  },
  {
    id: '4',
    title: 'Figma Auto-Layout Masterclass',
    source: 'YouTube',
    url: 'https://youtube.com',
    summary: 'How to build responsive components using advanced auto-layout constraints.',
    category: Category.UI_UX,
    isChecked: false,
    dateAdded: Date.now() - 100000,
    // Fix: Added required lastInteracted property
    lastInteracted: Date.now() - 100000
  }
];

export const NAV_ITEMS = [
  { label: 'Home', view: 'HOME' },
  { label: 'Projects', view: 'PROJECTS' },
  { label: 'Categories', view: 'ABOUT_US' },
];