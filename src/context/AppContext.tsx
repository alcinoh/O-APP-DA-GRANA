import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Transaction, CartItem, User, ChatMessage, Strategy } from '../types';
import { isFuture, parseISO } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'status'>) => void;
  confirmTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'picked'>) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  strategies: Strategy[];
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  pendingIncome: number;
  pendingExpense: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Don't overwrite guest user
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

  useEffect(() => {
    if (!user || user.isGuest) {
      if (!user) {
        setTransactions([]);
        setCart([]);
        setChatHistory([]);
        setStrategies([]);
      }
      return;
    }

    const txRef = collection(db, `users/${user.uid}/transactions`);
    const unsubTx = onSnapshot(txRef, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const cartRef = collection(db, `users/${user.uid}/cart`);
    const unsubCart = onSnapshot(cartRef, (snap) => {
      setCart(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
    });

    const chatRef = collection(db, `users/${user.uid}/chat`);
    const qChat = query(chatRef, orderBy('timestamp', 'asc'));
    const unsubChat = onSnapshot(qChat, (snap) => {
      setChatHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });

    const stratRef = collection(db, `users/${user.uid}/strategies`);
    const qStrat = query(stratRef, orderBy('createdAt', 'desc'));
    const unsubStrat = onSnapshot(qStrat, (snap) => {
      setStrategies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Strategy)));
    });

    return () => {
      unsubTx();
      unsubCart();
      unsubChat();
      unsubStrat();
    };
  }, [user]);

  const setUser = (newUser: User | null) => {
    // Setting via firebase auth handled above, this is fallback for local state updates if needed
    setUserState(newUser);
  };

  const loginAsGuest = () => {
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
    const newTx = {
      ...t,
      status: isFutureDate ? 'Pendente' : 'Confirmado',
      id: crypto.randomUUID()
    };
    
    if (user.isGuest) {
      setTransactions(prev => [...prev, newTx as Transaction]);
      return;
    }

    // Remova o id antes de salvar no Firestore se quiser que o Firebase gere o ID, 
    // ou mantenha e salve usando doc(db, ..., newTx.id)
    const { id, ...dataToSave } = newTx;
    const newRef = doc(collection(db, `users/${user.uid}/transactions`));
    await setDoc(newRef, dataToSave);
  };

  const confirmTransaction = async (id: string) => {
    if (!user) return;
    if (user.isGuest) {
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Confirmado' } : tx));
      return;
    }
    await updateDoc(doc(db, `users/${user.uid}/transactions/${id}`), { status: 'Confirmado' });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    if (user.isGuest) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      return;
    }
    await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
  };

  const addToCart = async (item: Omit<CartItem, 'id' | 'picked'>) => {
    if (!user) return;
    const newItem = { ...item, picked: false, id: crypto.randomUUID() };
    if (user.isGuest) {
      setCart(prev => [...prev, newItem]);
      return;
    }
    const { id, ...dataToSave } = newItem;
    const newRef = doc(collection(db, `users/${user.uid}/cart`));
    await setDoc(newRef, dataToSave);
  };

  const updateCartItem = async (id: string, updates: Partial<CartItem>) => {
    if (!user) return;
    if (user.isGuest) {
      setCart(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return;
    }
    await updateDoc(doc(db, `users/${user.uid}/cart/${id}`), updates);
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    if (user.isGuest) {
      setCart(prev => prev.filter(c => c.id !== id));
      return;
    }
    await deleteDoc(doc(db, `users/${user.uid}/cart/${id}`));
  };

  const clearCart = async () => {
    if (!user) return;
    if (user.isGuest) {
      setCart([]);
      return;
    }
    for (const item of cart) {
      await deleteDoc(doc(db, `users/${user.uid}/cart/${item.id}`));
    }
  };

  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user) return;
    const newMsg = { ...msg, timestamp: new Date().toISOString(), id: crypto.randomUUID() };
    if (user.isGuest) {
      setChatHistory(prev => [...prev, newMsg]);
      return;
    }
    const { id, ...dataToSave } = newMsg;
    const newRef = doc(collection(db, `users/${user.uid}/chat`));
    await setDoc(newRef, dataToSave);
  };

  const clearChat = async () => {
    if (!user) return;
    if (user.isGuest) {
      setChatHistory([]);
      return;
    }
    for (const msg of chatHistory) {
      await deleteDoc(doc(db, `users/${user.uid}/chat/${msg.id}`));
    }
  };

  const addStrategy = async (strategy: Omit<Strategy, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newStrategy = { ...strategy, createdAt: new Date().toISOString(), id: crypto.randomUUID() };
    if (user.isGuest) {
      setStrategies(prev => [newStrategy, ...prev]);
      return;
    }
    const { id, ...dataToSave } = newStrategy;
    const newRef = doc(collection(db, `users/${user.uid}/strategies`));
    await setDoc(newRef, dataToSave);
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
        balance,
        totalIncome,
        totalExpense,
        pendingIncome,
        pendingExpense,
        theme,
        toggleTheme,
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
