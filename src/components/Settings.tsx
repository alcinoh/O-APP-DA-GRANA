import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Globe, 
  Palette, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Sun, 
  Moon, 
  Fingerprint, 
  Lock, 
  Sliders, 
  RefreshCw, 
  Zap,
  CheckCircle2,
  Loader2,
  Smartphone,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SUPPORTED_LANGUAGES, THEMES_LIST } from '../lib/i18n';
import { LanguageId, ThemeId } from '../types';
import { cn } from './Layout';

export function Settings() {
  const { 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    t, 
    animationsEnabled, 
    setAnimationsEnabled,
    isBiometricsEnabled,
    enableBiometrics,
    disableBiometrics,
    setIsAppLocked,
    user
  } = useAppContext();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'language' | 'themes' | 'animations' | 'security'>('all');
  
  // Interactive states for the 3 button demo triggers
  const [btn1Count, setBtn1Count] = useState(0);
  const [btn2Active, setBtn2Active] = useState(false);
  const [btn3Status, setBtn3Status] = useState<'idle' | 'loading' | 'success'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectLanguage = (langId: LanguageId) => {
    setLanguage(langId);
    showToast(t('lang_changed_toast'));
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    const themeName = THEMES_LIST.find(th => th.id === themeId)?.name || themeId;
    showToast(`${t('theme_changed_toast')} ${themeName}`);
  };

  const triggerButton1 = () => {
    setBtn1Count(prev => prev + 1);
  };

  const triggerButton2 = () => {
    setBtn2Active(true);
    setTimeout(() => setBtn2Active(false), 800);
  };

  const triggerButton3 = () => {
    if (btn3Status !== 'idle') return;
    setBtn3Status('loading');
    setTimeout(() => {
      setBtn3Status('success');
      setTimeout(() => {
        setBtn3Status('idle');
      }, 2000);
    }, 900);
  };

  const tabs = [
    { id: 'all', label: 'Visão Geral', icon: Sliders },
    { id: 'language', label: 'Linguagem', icon: Globe },
    { id: 'themes', label: '7 Temas de Layout', icon: Palette },
    { id: 'animations', label: 'Micro-Animações', icon: Sparkles },
    { id: 'security', label: 'Segurança', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 border border-emerald-400/40 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-purple-500/10 dark:from-white/5 dark:via-white/5 dark:to-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-white/10 border border-emerald-500/20 dark:border-white/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Painel de Preferências</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('settings_title')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t('settings_subtitle')}
            </p>
          </div>

          {/* Quick Active Indicators */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xs backdrop-blur-md">
              <span className="text-base">
                {SUPPORTED_LANGUAGES.find(l => l.id === language)?.flag}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {SUPPORTED_LANGUAGES.find(l => l.id === language)?.nativeName}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xs backdrop-blur-md">
              <div 
                className="w-3 h-3 rounded-full shadow-xs"
                style={{ backgroundColor: THEMES_LIST.find(t => t.id === theme)?.accentColor || '#10b981' }}
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {THEMES_LIST.find(t => t.id === theme)?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white/70 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-2xl border-2 border-white/30 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* SECTION 1: LANGUAGE SELECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'language') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('lang_section_title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('lang_section_desc')}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              5 idiomas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <motion.button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl text-left border transition-all relative overflow-hidden cursor-pointer",
                    isSelected
                      ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 dark:border-emerald-400/80 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                      : "bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-3xl filter drop-shadow-sm">{lang.flag}</span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {lang.nativeName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {lang.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: 7 LAYOUT THEMES */}
      {(activeSubTab === 'all' || activeSubTab === 'themes') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('theme_section_title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('theme_section_desc')}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              7 Opções
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEMES_LIST.map((th) => {
              const isSelected = theme === th.id;
              return (
                <motion.div
                  key={th.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTheme(th.id)}
                  className={cn(
                    "group relative flex flex-col justify-between p-5 rounded-3xl border transition-all cursor-pointer overflow-hidden",
                    isSelected
                      ? "bg-slate-900/10 dark:bg-white/10 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                      : "bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/8"
                  )}
                >
                  {/* Miniature Visual Layout Preview */}
                  <div className={cn(
                    "w-full h-24 rounded-2xl mb-4 p-2.5 flex flex-col justify-between overflow-hidden shadow-inner border border-black/10 dark:border-white/10 bg-gradient-to-br",
                    th.bgPreview
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-md shadow-xs" 
                          style={{ backgroundColor: th.accentColor }} 
                        />
                        <div className="w-12 h-2 rounded-full bg-white/30" />
                      </div>
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: th.secondaryColor }} 
                      />
                    </div>

                    {/* Mini card skeleton */}
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-between border border-white/10">
                      <div className="space-y-1">
                        <div className="w-8 h-1.5 rounded-full bg-white/40" />
                        <div className="w-14 h-2.5 rounded-full bg-white/80 font-bold" />
                      </div>
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: th.accentColor }}
                      >
                        ✓
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{th.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                            {t('theme_active_badge')}
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                        {th.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {th.description}
                    </p>
                  </div>

                  {/* Color Palette Indicators & Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-xs" 
                        style={{ backgroundColor: th.accentColor }}
                        title="Cor Primária"
                      />
                      <span 
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-xs" 
                        style={{ backgroundColor: th.secondaryColor }}
                        title="Cor Secundária"
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTheme(th.id);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-200/80 dark:bg-white/10 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {isSelected ? t('theme_active_badge') : t('theme_apply_btn')}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: 3 INTERACTIVE BUTTON TRIGGER ANIMATIONS */}
      {(activeSubTab === 'all' || activeSubTab === 'animations') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('anim_section_title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('anim_section_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Master Switch for Interface Animations */}
          <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('anim_switch_title')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('anim_switch_desc')}
              </p>
            </div>

            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                animationsEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  animationsEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Demonstration of 3 Button Interaction Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Pulse & Soft Ripple Button */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Acionamento 1
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t('anim_test_btn1')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('anim_test_btn1_desc')}
                </p>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={triggerButton1}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 overflow-hidden cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Pressionar ({btn1Count} cliques)</span>
                  </span>
                  
                  {/* Subtle Expanding Ripple Effect */}
                  <motion.span
                    key={btn1Count}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/40 pointer-events-none"
                  />
                </motion.button>
              </div>
            </div>

            {/* 2. Magnetic Glow & Spring Physics */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Acionamento 2
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t('anim_test_btn2')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('anim_test_btn2_desc')}
                </p>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={triggerButton2}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className={cn(
                    "w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2 border border-purple-400/30 transition-all",
                    btn2Active && "ring-4 ring-purple-400/40"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{btn2Active ? '✨ Energia Ativada!' : 'Testar Mola & Glow'}</span>
                </motion.button>
              </div>
            </div>

            {/* 3. Smooth Success Morph */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Acionamento 3
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t('anim_test_btn3')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('anim_test_btn3_desc')}
                </p>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={triggerButton3}
                  whileHover={{ scale: btn3Status === 'idle' ? 1.03 : 1 }}
                  whileTap={{ scale: btn3Status === 'idle' ? 0.95 : 1 }}
                  className={cn(
                    "w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all duration-300",
                    btn3Status === 'idle' && "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20",
                    btn3Status === 'loading' && "bg-amber-500 text-white shadow-amber-500/20 cursor-wait",
                    btn3Status === 'success' && "bg-emerald-600 text-white shadow-emerald-500/25"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {btn3Status === 'idle' && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Confirmar Ação</span>
                      </motion.span>
                    )}
                    {btn3Status === 'loading' && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processando...</span>
                      </motion.span>
                    )}
                    {btn3Status === 'success' && (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-1.5 text-white"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirmado com Sucesso!</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: SECURITY & BIO LOCK */}
      {(activeSubTab === 'all' || activeSubTab === 'security') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('sec_section_title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('sec_section_desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Fingerprint className={cn("w-5 h-5", isBiometricsEnabled ? "text-emerald-500" : "text-slate-400")} />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {t('sec_webauthn_status')}
                  </span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                    isBiometricsEnabled 
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                  )}>
                    {isBiometricsEnabled ? t('sec_webauthn_enabled') : t('sec_webauthn_disabled')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBiometricsEnabled 
                    ? 'Sua chave WebAuthn nativa está registrada com sucesso neste dispositivo.'
                    : 'Ative para proteger seus extratos e dados contra acessos não autorizados.'}
                </p>
              </div>

              {isBiometricsEnabled && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsAppLocked(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t('sec_lock_action')}</span>
                </motion.button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* System info footer card */}
      <div className="p-4 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Assessoria Financeira Pro • v2.1</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {t('saved_badge')}
        </span>
      </div>
    </div>
  );
}
