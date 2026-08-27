import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Transaction, CartItem, User, ChatMessage, Strategy } from '../types';
import { isFuture, parseISO } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'status'>) => Promise<void>;
  confirmTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'picked'>) => Promise<void>;
  updateCartItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<ChatMessage>;
  clearChat: () => Promise<void>;
  strategies: Strategy[];
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  pendingIncome: number;
  pendingExpense: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isHydrating: boolean;
  isLoadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isHydrating, setIsHydrating] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Monitora alterações na autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUserState(prev => {
        if (prev?.isGuest) return prev;
        
        if (firebaseUser) {
          return {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || undefined,
            photoURL: firebaseUser.photoURL || undefined
          };
        }
        return null;
      });
    });
    return () => unsubscribe();
  }, []);

  // Sincronização contínua em tempo real via onSnapshot (Persistência Garantida)
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCart([]);
      setChatHistory([]);
      setStrategies([]);
      setIsHydrating(false);
      return;
    }

    if (user.isGuest) {
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);

    let loadedCount = 0;
    const checkHydration = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        setIsHydrating(false);
      }
    };

    // Timeout de segurança para desbloquear a UI caso o Firestore responda rapidamente ou esteja vazio
    const timer = setTimeout(() => {
      setIsHydrating(false);
    }, 2000);

    const txRef = collection(db, `users/${user.uid}/transactions`);
    const unsubTx = onSnapshot(txRef, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      // Ordena por data decrescente
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(items);
      checkHydration();
    }, (err) => {
      console.error("Erro snapshot transactions:", err);
      checkHydration();
    });

    const cartRef = collection(db, `users/${user.uid}/cart`);
    const unsubCart = onSnapshot(cartRef, (snap) => {
      setCart(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
      checkHydration();
    }, (err) => {
      console.error("Erro snapshot cart:", err);
      checkHydration();
    });

    const chatRef = collection(db, `users/${user.uid}/chat`);
    const unsubChat = onSnapshot(chatRef, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      msgs.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      setChatHistory(msgs);
    }, (err) => console.error("Erro snapshot chat:", err));

    const stratRef = collection(db, `users/${user.uid}/strategies`);
    const unsubStrat = onSnapshot(stratRef, (snap) => {
      const strats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Strategy));
      strats.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setStrategies(strats);
    }, (err) => console.error("Erro snapshot strategies:", err));

    return () => {
      clearTimeout(timer);
      unsubTx();
      unsubCart();
      unsubChat();
      unsubStrat();
    };
  }, [user?.uid, user?.isGuest]);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const loginAsGuest = () => {
    setIsHydrating(false);
    setUserState({
      uid: 'guest',
      name: 'Visitante (Teste)',
      isGuest: true
    });
  };

  const logout = async () => {
    if (user?.isGuest) {
      setUserState(null);
      setTransactions([]);
      setCart([]);
      setChatHistory([]);
      setStrategies([]);
      return;
    }
    await signOut(auth);
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'status'>) => {
    if (!user) return;
    const isFutureDate = isFuture(parseISO(t.date));
    const newTx: Transaction = {
      ...t,
      status: isFutureDate ? 'Pendente' : 'Confirmado',
      id: crypto.randomUUID()
    };
    
    // Atualização otimista imediata
    setTransactions(prev => [newTx, ...prev]);

    if (user.isGuest) return;

    try {
      const { id, ...dataToSave } = newTx;
      const newRef = doc(collection(db, `users/${user.uid}/transactions`));
      await setDoc(newRef, dataToSave);
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
    }
  };

  const confirmTransaction = async (id: string) => {
    if (!user) return;
    // Atualização otimista imediata
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Confirmado' } : tx));

    if (user.isGuest) return;

    try {
      await updateDoc(doc(db, `users/${user.uid}/transactions/${id}`), { status: 'Confirmado' });
    } catch (err) {
      console.error("Erro ao confirmar transação:", err);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    // Atualização otimista imediata
    setTransactions(prev => prev.filter(tx => tx.id !== id));

    if (user.isGuest) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
    } catch (err) {
      console.error("Erro ao deletar transação:", err);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id' | 'picked'>) => {
    if (!user) return;
    const newItem: CartItem = { ...item, picked: false, id: crypto.randomUUID() };
    
    // Atualização otimista imediata
    setCart(prev => [...prev, newItem]);

    if (user.isGuest) return;

    try {
      const { id, ...dataToSave } = newItem;
      const newRef = doc(collection(db, `users/${user.uid}/cart`));
      await setDoc(newRef, dataToSave);
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho:", err);
    }
  };

  const updateCartItem = async (id: string, updates: Partial<CartItem>) => {
    if (!user) return;
    // Atualização otimista imediata
    setCart(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    if (user.isGuest) return;

    try {
      await updateDoc(doc(db, `users/${user.uid}/cart/${id}`), updates);
    } catch (err) {
      console.error("Erro ao atualizar item do carrinho:", err);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    // Atualização otimista imediata
    setCart(prev => prev.filter(c => c.id !== id));

    if (user.isGuest) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/cart/${id}`));
    } catch (err) {
      console.error("Erro ao remover item do carrinho:", err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const currentCart = [...cart];
    // Atualização otimista imediata
    setCart([]);

    if (user.isGuest) return;

    try {
      for (const item of currentCart) {
        await deleteDoc(doc(db, `users/${user.uid}/cart/${item.id}`));
      }
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
    }
  };

  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    const newMsg: ChatMessage = { 
      ...msg, 
      timestamp: new Date().toISOString(), 
      id: crypto.randomUUID() 
    };

    // Atualização otimista imediata para exibir na tela no mesmo instante
    setChatHistory(prev => [...prev, newMsg]);

    if (user && !user.isGuest) {
      try {
        const { id, ...dataToSave } = newMsg;
        const newRef = doc(collection(db, `users/${user.uid}/chat`));
        await setDoc(newRef, dataToSave);
      } catch (err) {
        console.error("Erro ao salvar mensagem do chat no Firestore:", err);
      }
    }

    return newMsg;
  };

  const clearChat = async () => {
    if (!user) return;
    const currentChat = [...chatHistory];
    setChatHistory([]);

    if (user.isGuest) return;

    try {
      for (const msg of currentChat) {
        await deleteDoc(doc(db, `users/${user.uid}/chat/${msg.id}`));
      }
    } catch (err) {
      console.error("Erro ao limpar chat:", err);
    }
  };

  const addStrategy = async (strategy: Omit<Strategy, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newStrategy: Strategy = { ...strategy, createdAt: new Date().toISOString(), id: crypto.randomUUID() };
    
    // Atualização otimista imediata
    setStrategies(prev => [newStrategy, ...prev]);

    if (user.isGuest) return;

    try {
      const { id, ...dataToSave } = newStrategy;
      const newRef = doc(collection(db, `users/${user.uid}/strategies`));
      await setDoc(newRef, dataToSave);
    } catch (err) {
      console.error("Erro ao salvar estratégia:", err);
    }
  };

  const deleteStrategy = async (id: string) => {
    if (!user) return;
    setStrategies(prev => prev.filter(s => s.id !== id));

    if (user.isGuest) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/strategies/${id}`));
    } catch (err) {
      console.error("Erro ao excluir estratégia:", err);
    }
  };

  // Derived state
  const { balance, totalIncome, totalExpense, pendingIncome, pendingExpense } = useMemo(() => {
    let bal = 0;
    let inc = 0;
    let exp = 0;
    let pInc = 0;
    let pExp = 0;

    transactions.forEach((t) => {
      if (t.status === 'Confirmado') {
        if (t.type === 'income') {
          bal += t.amount;
          inc += t.amount;
        } else {
          bal -= t.amount;
          exp += t.amount;
        }
      } else {
        if (t.type === 'income') pInc += t.amount;
        else pExp += t.amount;
      }
    });

    return { balance: bal, totalIncome: inc, totalExpense: exp, pendingIncome: pInc, pendingExpense: pExp };
  }, [transactions]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loginAsGuest,
        logout,
        transactions,
        addTransaction,
        confirmTransaction,
        deleteTransaction,
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        chatHistory,
        addChatMessage,
        clearChat,
        strategies,
        addStrategy,
        deleteStrategy,
        balance,
        totalIncome,
        totalExpense,
        pendingIncome,
        pendingExpense,
        theme,
        toggleTheme,
        isHydrating,
        isLoadingData: isHydrating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

