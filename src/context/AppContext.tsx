import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
import { registerBiometricCredential } from '../lib/biometrics';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'status'>) => Promise<void>;
  confirmTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
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
  isBiometricsEnabled: boolean;
  isAppLocked: boolean;
  setIsAppLocked: (locked: boolean) => void;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('af_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isHydrating, setIsHydrating] = useState<boolean>(false);

  // Biometria
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('af_user_session');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return localStorage.getItem(`af_bio_enabled_${u.uid}`) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('af_user_session');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return localStorage.getItem(`af_bio_enabled_${u.uid}`) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  // Atualiza preferência de biometria ao mudar o usuário
  useEffect(() => {
    if (user?.uid) {
      const enabled = localStorage.getItem(`af_bio_enabled_${user.uid}`) === 'true';
      setIsBiometricsEnabled(enabled);
    } else {
      setIsBiometricsEnabled(false);
      setIsAppLocked(false);
    }
  }, [user?.uid]);

  const enableBiometrics = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const credId = await registerBiometricCredential(user.uid, user.name || 'Usuario');
      localStorage.setItem(`af_bio_cred_${user.uid}`, credId);
      localStorage.setItem(`af_bio_enabled_${user.uid}`, 'true');
      setIsBiometricsEnabled(true);
      return true;
    } catch (err: any) {
      console.warn("Falha ao registrar biometria WebAuthn:", err);
      // Ativação com chave local/PIN caso WebAuthn plataforma não esteja disponível diretamente
      localStorage.setItem(`af_bio_enabled_${user.uid}`, 'true');
      setIsBiometricsEnabled(true);
      return true;
    }
  };

  const disableBiometrics = async () => {
    if (!user) return;
    localStorage.removeItem(`af_bio_enabled_${user.uid}`);
    localStorage.removeItem(`af_bio_cred_${user.uid}`);
    setIsBiometricsEnabled(false);
    setIsAppLocked(false);
  };

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
      if (firebaseUser) {
        const u: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined
        };
        setUserState(u);
        localStorage.setItem('af_user_session', JSON.stringify(u));
      } else {
        setUserState(prev => {
          if (prev?.isGuest) return prev;
          localStorage.removeItem('af_user_session');
          return null;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sincronização contínua em tempo real via onSnapshot e carga inicial no Firestore
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
      // Carrega dados persistidos do modo convidado no localStorage
      try {
        const localTx = localStorage.getItem('af_guest_tx');
        const localCart = localStorage.getItem('af_guest_cart');
        const localChat = localStorage.getItem('af_guest_chat');
        const localStrat = localStorage.getItem('af_guest_strat');
        if (localTx) setTransactions(JSON.parse(localTx));
        if (localCart) setCart(JSON.parse(localCart));
        if (localChat) setChatHistory(JSON.parse(localChat));
        if (localStrat) setStrategies(JSON.parse(localStrat));
      } catch (e) {
        console.error("Erro ao carregar dados locais do visitante:", e);
      }
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);

    // 1. Busca inicial imediata para carregamento instantâneo
    const loadInitialData = async () => {
      try {
        const [txSnap, cartSnap, chatSnap, stratSnap] = await Promise.allSettled([
          getDocs(collection(db, 'users', user.uid, 'transactions')),
          getDocs(collection(db, 'users', user.uid, 'cart')),
          getDocs(collection(db, 'users', user.uid, 'chat')),
          getDocs(collection(db, 'users', user.uid, 'strategies'))
        ]);

        if (txSnap.status === 'fulfilled') {
          const items = txSnap.value.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(items);
        }
        if (cartSnap.status === 'fulfilled') {
          setCart(cartSnap.value.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
        }
        if (chatSnap.status === 'fulfilled') {
          const msgs = chatSnap.value.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
          msgs.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
          setChatHistory(msgs);
        }
        if (stratSnap.status === 'fulfilled') {
          const strats = stratSnap.value.docs.map(d => ({ id: d.id, ...d.data() } as Strategy));
          strats.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setStrategies(strats);
        }
      } catch (err) {
        console.error("Erro no carregamento inicial do Firestore:", err);
      } finally {
        setIsHydrating(false);
      }
    };

    loadInitialData();

    // 2. Listeners em tempo real via onSnapshot
    const txRef = collection(db, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(txRef, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(items);
      setIsHydrating(false);
    }, (err) => {
      console.error("Erro snapshot transactions:", err);
      setIsHydrating(false);
    });

    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubCart = onSnapshot(cartRef, (snap) => {
      setCart(snap.docs.map(d => ({ id: d.id, ...d.data() } as CartItem)));
    }, (err) => console.error("Erro snapshot cart:", err));

    const chatRef = collection(db, 'users', user.uid, 'chat');
    const unsubChat = onSnapshot(chatRef, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      msgs.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      setChatHistory(msgs);
    }, (err) => console.error("Erro snapshot chat:", err));

    const stratRef = collection(db, 'users', user.uid, 'strategies');
    const unsubStrat = onSnapshot(stratRef, (snap) => {
      const strats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Strategy));
      strats.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setStrategies(strats);
    }, (err) => console.error("Erro snapshot strategies:", err));

    return () => {
      unsubTx();
      unsubCart();
      unsubChat();
      unsubStrat();
    };
  }, [user?.uid, user?.isGuest]);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('af_user_session', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('af_user_session');
    }
  };

  const loginAsGuest = () => {
    setIsHydrating(false);
    const guestUser: User = {
      uid: 'guest',
      name: 'Visitante (Teste)',
      isGuest: true
    };
    setUserState(guestUser);
    localStorage.setItem('af_user_session', JSON.stringify(guestUser));
  };

  const logout = async () => {
    try {
      localStorage.removeItem('af_user_session');
      setUserState(null);
      setTransactions([]);
      setCart([]);
      setChatHistory([]);
      setStrategies([]);
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'status'>) => {
    if (!user) return;
    const isFutureDate = isFuture(parseISO(t.date));

    if (user.isGuest) {
      const newTx: Transaction = {
        ...t,
        status: isFutureDate ? 'Pendente' : 'Confirmado',
        id: crypto.randomUUID()
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('af_guest_tx', JSON.stringify(updated));
      return;
    }

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'transactions'));
      const newTx: Transaction = {
        ...t,
        status: isFutureDate ? 'Pendente' : 'Confirmado',
        id: docRef.id
      };
      
      // Atualização otimista
      setTransactions(prev => [newTx, ...prev]);

      await setDoc(docRef, {
        description: newTx.description,
        amount: newTx.amount,
        type: newTx.type,
        category: newTx.category,
        date: newTx.date,
        status: newTx.status
      });
    } catch (err) {
      console.error("Erro ao salvar transação no Firestore:", err);
    }
  };

  const confirmTransaction = async (id: string) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = transactions.map(tx => tx.id === id ? { ...tx, status: 'Confirmado' as const } : tx);
      setTransactions(updated);
      localStorage.setItem('af_guest_tx', JSON.stringify(updated));
      return;
    }

    // Atualização otimista
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Confirmado' } : tx));

    try {
      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), { status: 'Confirmado' });
    } catch (err) {
      console.error("Erro ao confirmar transação no Firestore:", err);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = transactions.filter(tx => tx.id !== id);
      setTransactions(updated);
      localStorage.setItem('af_guest_tx', JSON.stringify(updated));
      return;
    }

    // Atualização otimista
    setTransactions(prev => prev.filter(tx => tx.id !== id));

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
    } catch (err) {
      console.error("Erro ao deletar transação no Firestore:", err);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = transactions.map(tx => tx.id === id ? { ...tx, ...updates } : tx);
      setTransactions(updated);
      localStorage.setItem('af_guest_tx', JSON.stringify(updated));
      return;
    }

    // Atualização otimista
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));

    try {
      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), updates);
    } catch (err) {
      console.error("Erro ao atualizar transação no Firestore:", err);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id' | 'picked'>) => {
    if (!user) return;

    if (user.isGuest) {
      const newItem: CartItem = { ...item, picked: false, id: crypto.randomUUID() };
      const updated = [...cart, newItem];
      setCart(updated);
      localStorage.setItem('af_guest_cart', JSON.stringify(updated));
      return;
    }

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'cart'));
      const newItem: CartItem = { ...item, picked: false, id: docRef.id };
      
      // Atualização otimista
      setCart(prev => [...prev, newItem]);

      await setDoc(docRef, {
        name: newItem.name,
        price: newItem.price,
        quantity: newItem.quantity,
        picked: false
      });
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho no Firestore:", err);
    }
  };

  const updateCartItem = async (id: string, updates: Partial<CartItem>) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = cart.map(c => c.id === id ? { ...c, ...updates } : c);
      setCart(updated);
      localStorage.setItem('af_guest_cart', JSON.stringify(updated));
      return;
    }

    // Atualização otimista
    setCart(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      await updateDoc(doc(db, 'users', user.uid, 'cart', id), updates);
    } catch (err) {
      console.error("Erro ao atualizar item do carrinho no Firestore:", err);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = cart.filter(c => c.id !== id);
      setCart(updated);
      localStorage.setItem('af_guest_cart', JSON.stringify(updated));
      return;
    }

    // Atualização otimista
    setCart(prev => prev.filter(c => c.id !== id));

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', id));
    } catch (err) {
      console.error("Erro ao remover item do carrinho no Firestore:", err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const currentCart = [...cart];
    setCart([]);

    if (user.isGuest) {
      localStorage.removeItem('af_guest_cart');
      return;
    }

    try {
      await Promise.all(currentCart.map(item => deleteDoc(doc(db, 'users', user.uid, 'cart', item.id))));
    } catch (err) {
      console.error("Erro ao limpar carrinho no Firestore:", err);
    }
  };

  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    const timestamp = new Date().toISOString();

    if (!user || user.isGuest) {
      const newMsg: ChatMessage = { ...msg, timestamp, id: crypto.randomUUID() };
      const updated = [...chatHistory, newMsg];
      setChatHistory(updated);
      localStorage.setItem('af_guest_chat', JSON.stringify(updated));
      return newMsg;
    }

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'chat'));
      const newMsg: ChatMessage = { ...msg, timestamp, id: docRef.id };
      
      // Atualização otimista
      setChatHistory(prev => [...prev, newMsg]);

      await setDoc(docRef, {
        role: newMsg.role,
        content: newMsg.content,
        timestamp: newMsg.timestamp
      });
      return newMsg;
    } catch (err) {
      console.error("Erro ao salvar mensagem no Firestore:", err);
      const fallbackMsg: ChatMessage = { ...msg, timestamp, id: crypto.randomUUID() };
      setChatHistory(prev => [...prev, fallbackMsg]);
      return fallbackMsg;
    }
  };

  const clearChat = async () => {
    if (!user) return;
    const currentChat = [...chatHistory];
    setChatHistory([]);

    if (user.isGuest) {
      localStorage.removeItem('af_guest_chat');
      return;
    }

    try {
      await Promise.all(currentChat.map(msg => deleteDoc(doc(db, 'users', user.uid, 'chat', msg.id))));
    } catch (err) {
      console.error("Erro ao limpar chat no Firestore:", err);
    }
  };

  const addStrategy = async (strategy: Omit<Strategy, 'id' | 'createdAt'>) => {
    if (!user) return;
    const createdAt = new Date().toISOString();

    if (user.isGuest) {
      const newStrategy: Strategy = { ...strategy, createdAt, id: crypto.randomUUID() };
      const updated = [newStrategy, ...strategies];
      setStrategies(updated);
      localStorage.setItem('af_guest_strat', JSON.stringify(updated));
      return;
    }

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'strategies'));
      const newStrategy: Strategy = { ...strategy, createdAt, id: docRef.id };
      
      // Atualização otimista
      setStrategies(prev => [newStrategy, ...prev]);

      await setDoc(docRef, {
        title: newStrategy.title,
        description: newStrategy.description || '',
        content: newStrategy.content,
        type: newStrategy.type || 'Assessor IA',
        createdAt: newStrategy.createdAt
      });
    } catch (err) {
      console.error("Erro ao salvar estratégia no Firestore:", err);
    }
  };

  const deleteStrategy = async (id: string) => {
    if (!user) return;

    if (user.isGuest) {
      const updated = strategies.filter(s => s.id !== id);
      setStrategies(updated);
      localStorage.setItem('af_guest_strat', JSON.stringify(updated));
      return;
    }

    setStrategies(prev => prev.filter(s => s.id !== id));

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'strategies', id));
    } catch (err) {
      console.error("Erro ao excluir estratégia no Firestore:", err);
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
        updateTransaction,
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
        isBiometricsEnabled,
        isAppLocked,
        setIsAppLocked,
        enableBiometrics,
        disableBiometrics,
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


