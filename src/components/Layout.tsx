import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ListOrdered, 
  ShoppingCart, 
  BarChart3, 
  Bot, 
  LogOut, 
  Library, 
  Moon, 
  Sun, 
  Download, 
  Fingerprint, 
  Lock, 
  ShieldCheck, 
  Check, 
  Loader2,
  Info,
  AlertCircle,
  Sliders,
  Globe,
  Palette,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChangelogModal } from './ChangelogModal';
import { THEMES_LIST, SUPPORTED_LANGUAGES } from '../lib/i18n';
import { motion } from 'motion/react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { 
    user, 
    logout, 
    theme, 
    toggleTheme, 
    language,
    t,
    isBiometricsEnabled, 
    enableBiometrics, 
    disableBiometrics, 
    setIsAppLocked 
  } = useAppContext();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isTogglingBio, setIsTogglingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleToggleBiometrics = async () => {
    setIsTogglingBio(true);
    setBioError(null);
    try {
      if (isBiometricsEnabled) {
        await disableBiometrics();
      } else {
        await enableBiometrics();
      }
    } catch (err: any) {
      console.warn("Erro ao configurar biometria:", err);
      if (err.name === 'NotAllowedError') {
        setBioError("Registro biométrico cancelado pelo usuário.");
      } else {
        setBioError("Não foi possível cadastrar a biometria neste navegador.");
      }
      setTimeout(() => setBioError(null), 4000);
    } finally {
      setIsTogglingBio(false);
    }
  };

  const currentThemeObj = THEMES_LIST.find(th => th.id === theme) || THEMES_LIST[0];
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: Home },
    { id: 'transactions', label: t('nav_transactions'), icon: ListOrdered },
    { id: 'cart', label: t('nav_cart'), icon: ShoppingCart },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3 },
    { id: 'chat', label: t('nav_chat'), icon: Bot },
    { id: 'strategies', label: t('nav_strategies'), icon: Library },
    { id: 'options', label: t('nav_options'), icon: Sliders },
  ];

  return (
    <div className="flex h-screen app-canvas-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r sidebar-themed backdrop-blur-xl transition-colors duration-300">
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 shadow-sm theme-btn-accent">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                'AF'
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white uppercase leading-tight">
                {t('app_name')}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('app_subtitle')}
              </p>
            </div>
          </div>

          {/* Quick theme pill indicator */}
          <button
            onClick={() => setActiveTab('options')}
            className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-black/5 dark:border-white/10"
            title="Abrir Opções de Tema e Idioma"
          >
            <span>{currentLangObj.flag}</span>
            <span 
              className="w-3 h-3 rounded-full shadow-xs" 
              style={{ backgroundColor: currentThemeObj.accentColor }} 
            />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                activeTab === item.id
                  ? "bg-emerald-500/10 dark:bg-white/10 text-emerald-700 dark:text-white font-bold shadow-sm border border-emerald-500/20 dark:border-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-emerald-600 dark:text-emerald-400" : "")} />
                <span>{item.label}</span>
              </div>

              {item.id === 'options' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all animate-pulse cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('install_btn')}</span>
            </button>
          )}

          {/* Biometria Config Card */}
          <div className="p-3 bg-slate-100/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className={cn("w-4 h-4", isBiometricsEnabled ? "text-emerald-500" : "text-slate-400")} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isBiometricsEnabled ? t('bio_active') : t('bio_title')}
                </span>
              </div>

              <button
                onClick={handleToggleBiometrics}
                disabled={isTogglingBio}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
                  isBiometricsEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"
                )}
                title={isBiometricsEnabled ? "Desativar Biometria" : "Ativar Biometria"}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isBiometricsEnabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Status ou Ações de Biometria */}
            {isTogglingBio ? (
              <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('bio_registering')}</span>
              </div>
            ) : isBiometricsEnabled ? (
              <button
                onClick={() => setIsAppLocked(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/20 transition-colors cursor-pointer"
                title="Bloquear aplicativo agora com biometria"
              >
                <Lock className="w-3 h-3" />
                <span>{t('bio_lock_now')}</span>
              </button>
            ) : (
              <button
                onClick={handleToggleBiometrics}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-200/80 dark:bg-white/10 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Fingerprint className="w-3 h-3" />
                <span>{t('bio_enable')}</span>
              </button>
            )}

            {bioError && (
              <p className="text-[10px] text-rose-500 dark:text-rose-400 leading-tight">
                {bioError}
              </p>
            )}
          </div>

          {/* Quick theme switcher button */}
          <button
            onClick={() => setActiveTab('options')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors text-xs font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentThemeObj.name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">7 temas</span>
          </button>
          
          {/* User Profile Info */}
          <div className="p-3 bg-slate-100/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">{user?.email || (user?.isGuest ? t('guest_mode') : '')}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition-all cursor-pointer"
              title="Desconectar da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout_btn')}</span>
            </button>
          </div>

          {/* Discreet Version Link */}
          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 opacity-60 hover:opacity-100 transition-opacity cursor-pointer py-1 px-2 rounded-md hover:bg-slate-200/40 dark:hover:bg-white/5"
              title={t('version_title')}
            >
              <span>v2.1</span>
              <Info className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="md:hidden flex items-center justify-between p-4 header-themed backdrop-blur-md border-b">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-sm theme-btn-accent">
               {user?.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : 'AF'}
             </div>
             <div>
               <h1 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight tracking-wider truncate">
                 {t('app_name')}
               </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Quick Biometrics lock / toggle */}
            <button
              onClick={() => {
                if (isBiometricsEnabled) {
                  setIsAppLocked(true);
                } else {
                  handleToggleBiometrics();
                }
              }}
              className={cn(
                "p-2 rounded-lg border transition-colors cursor-pointer",
                isBiometricsEnabled 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
              )}
              title={isBiometricsEnabled ? "Bloquear App com Biometria" : "Ativar Biometria"}
            >
              {isBiometricsEnabled ? <Lock className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
            </button>

            {installPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 active:bg-emerald-500/30 transition-colors cursor-pointer"
                title="Instalar App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('install_quick')}</span>
              </button>
            )}

            {/* Direct Options shortcut button */}
            <button 
              onClick={() => setActiveTab('options')} 
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                activeTab === 'options' 
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
              )}
              title="Menu de Opções"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Mobile discreet info button */}
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer"
              title={t('version_title')}
            >
              <Info className="w-4 h-4" />
            </button>

            <button 
              onClick={logout} 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/20 transition-colors cursor-pointer"
              title={t('logout_btn')}
            >
              <LogOut className="w-3.5 h-3.5" />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 sidebar-themed backdrop-blur-xl border-t pb-safe z-40 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-start p-2 min-w-max gap-1 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center p-2 min-w-[60px] rounded-lg transition-colors cursor-pointer",
                activeTab === item.id
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-1", activeTab === item.id && "text-emerald-600 dark:text-emerald-400")} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}

