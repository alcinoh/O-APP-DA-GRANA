import React from 'react';
import { Home, ListOrdered, ShoppingCart, BarChart3, Bot, LogOut, Library, Moon, Sun } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout, theme, toggleTheme } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'transactions', label: 'Lançamentos', icon: ListOrdered },
    { id: 'cart', label: 'Carrinho', icon: ShoppingCart },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
    { id: 'chat', label: 'Assessor IA', icon: Bot },
    { id: 'strategies', label: 'Estratégias', icon: Library },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-slate-200 overflow-hidden font-sans select-none relative transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none transition-colors"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none transition-colors"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 z-10 transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0 shadow-sm">
            {user?.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : 'AF'}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight tracking-wider truncate">ASSESSORIA</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold leading-tight truncate">Finanças Pessoais</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === item.id
                  ? "bg-emerald-500/10 dark:bg-white/10 text-emerald-700 dark:text-white font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors text-sm font-medium"
          >
            {theme === 'dark' ? <><Sun className="w-4 h-4 text-amber-400"/> Modo Claro</> : <><Moon className="w-4 h-4 text-indigo-500"/> Modo Escuro</>}
          </button>
          
          <div className="p-3 bg-slate-100/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">{user?.email || (user?.isGuest ? 'Modo Visitante' : '')}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition-all"
              title="Desconectar da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="md:hidden flex items-center justify-between p-4 bg-white/60 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-sm">
               {user?.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : 'AF'}
             </div>
             <h1 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight tracking-wider truncate">ASSESSORIA</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400"/> : <Moon className="w-4 h-4 text-indigo-500"/>}
            </button>
            <button 
              onClick={logout} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/20 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe z-50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-start p-2 min-w-max gap-1 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center p-2 min-w-[64px] rounded-lg transition-colors",
                activeTab === item.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", activeTab === item.id && "text-emerald-600 dark:text-emerald-400")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
