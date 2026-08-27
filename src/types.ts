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
