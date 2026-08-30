export type ThemeId = 
  | 'dark'      // Escuro Clássico
  | 'light'     // Claro Clean
  | 'emerald'   // Esmeralda Private
  | 'safira'    // Safira Oceano
  | 'nebula'    // Nebula Cyber
  | 'sunset'    // Ouro & Âmbar
  | 'crimson';  // Carmim Titanium

export type LanguageId = 'pt' | 'en' | 'es' | 'fr' | 'it';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light' | 'luxury' | 'neon' | 'cyber';
  accentColor: string;
  secondaryColor: string;
  bgPreview: string;
  tag: string;
  description: string;
}

export interface LanguageConfig {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  code: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string; // ISO string
  status: 'Pendente' | 'Confirmado';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  picked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Strategy {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  type: string;
}

export interface User {
  uid: string;
  name: string;
  email?: string;
  photoURL?: string;
  isGuest?: boolean;
}
