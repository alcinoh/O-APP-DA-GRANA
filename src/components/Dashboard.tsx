import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Bot, 
  ArrowRight, 
  Loader2, 
  ChevronDown, 
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  ListOrdered,
  Calendar,
  Coins,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseISO, isFuture, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './Layout';
import { BankStatementModal } from './BankStatementModal';
import { getSourceInfo } from '../lib/sourceHelper';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  onNavigateToChat?: () => void;
}

export function Dashboard({ setActiveTab, onNavigateToChat }: DashboardProps) {
  const { 
    transactions, 
    confirmTransaction, 
    isHydrating 
  } = useAppContext();

  const [expandedCard, setExpandedCard] = useState<'balance' | 'income' | 'expense' | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [periodScope, setPeriodScope] = useState<'currentMonth' | 'all'>('currentMonth');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => startOfMonth(now), [now]);
  const currentMonthEnd = useMemo(() => endOfMonth(now), [now]);

  const handleGoToChat = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    } else if (setActiveTab) {
      setActiveTab('chat');
    }
  };

  const handleGoToTransactions = () => {
    if (setActiveTab) {
      setActiveTab('transactions');
    }
  };

  // Transactions filtered by period scope (Default: Current Month - strictly matching the Bank Statement)
  const scopedTransactions = useMemo(() => {
    if (periodScope === 'all') return transactions;
    return transactions.filter(t => {
      try {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
      } catch {
        return false;
      }
    });
  }, [transactions, periodScope, currentMonthStart, currentMonthEnd]);

  // Balances calculation identical to Extrato do Mês Atual
  const currentMonthStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    scopedTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: scopedTransactions.length
    };
  }, [scopedTransactions]);

  // Breakdown of money availability by SOURCE (Where money came from & where it was spent)
  const sourcesBreakdown = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; txCount: number }>();

    // Common standard sources so user always has clear tabs
    const standardSources = ['Salário', 'Vale Alimentação', 'Vale Refeição', 'Renda Extra'];
    standardSources.forEach(s => map.set(s, { income: 0, expense: 0, txCount: 0 }));

    // Aggregate scoped transactions
    scopedTransactions.forEach(t => {
      const s = t.source || 'Salário';
      const current = map.get(s) || { income: 0, expense: 0, txCount: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      current.txCount += 1;
      map.set(s, current);
    });

    const result: Array<{
      source: string;
      info: ReturnType<typeof getSourceInfo>;
      income: number;
      expense: number;
      balance: number;
      txCount: number;
      percentageUsed: number;
    }> = [];

    map.forEach((data, source) => {
      // Show default sources or any custom source that has movements
      if (data.income > 0 || data.expense > 0 || standardSources.includes(source)) {
        const bal = data.income - data.expense;
        const pct = data.income > 0 
          ? Math.min(Math.round((data.expense / data.income) * 100), 100) 
          : (data.expense > 0 ? 100 : 0);
        result.push({
          source,
          info: getSourceInfo(source),
          income: data.income,
          expense: data.expense,
          balance: bal,
          txCount: data.txCount,
          percentageUsed: pct
        });
      }
    });

    // Sort by income descending
    return result.sort((a, b) => b.income - a.income);
  }, [scopedTransactions]);

  const pendingTransactions = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Pendente')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const pendingStats = useMemo(() => {
    let pIncome = 0;
    let pExpense = 0;
    transactions.filter(t => t.status === 'Pendente').forEach(t => {
      if (t.type === 'income') pIncome += t.amount;
      else pExpense += t.amount;
    });
    return { pIncome, pExpense };
  }, [transactions]);

  const toggleCard = (cardType: 'balance' | 'income' | 'expense') => {
    setExpandedCard(prev => prev === cardType ? null : cardType);
  };

  // Mini-extratos with optional source filter
  const filteredScopedList = useMemo(() => {
    if (!selectedSourceFilter) return scopedTransactions;
    return scopedTransactions.filter(t => (t.source || 'Salário') === selectedSourceFilter);
  }, [scopedTransactions, selectedSourceFilter]);

  const recentBalanceItems = useMemo(() => {
    return filteredScopedList
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredScopedList]);

  const recentIncomeItems = useMemo(() => {
    return filteredScopedList
      .filter(t => t.type === 'income')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredScopedList]);

  const recentExpenseItems = useMemo(() => {
    return filteredScopedList
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredScopedList]);

  return (
    <div className="space-y-8 pb-10">
      {isHydrating && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm shadow-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Sincronizando seus dados em tempo real...</span>
        </motion.div>
      )}

      {/* Header with Scope Switch & Statement Button */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              Visão Geral
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-white/10 border border-emerald-500/20 dark:border-white/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold capitalize">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(now, "MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
            Situação real atualizada e detalhamento de onde sai e entra o seu dinheiro.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scope Toggle: Mês Atual vs Todo o Período */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-white/10 rounded-2xl border border-slate-300/60 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setPeriodScope('currentMonth')}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                periodScope === 'currentMonth'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>Mês Atual (Extrato)</span>
            </button>
            <button
              onClick={() => setPeriodScope('all')}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                periodScope === 'all'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>Geral Acumulado</span>
            </button>
          </div>

          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Extrato Bancário</span>
          </button>
        </div>
      </header>

      {/* 3 Main Interactive Balance Cards (Same layout, exact updated figures) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Card 1: Saldo Atual Real */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => toggleCard('balance')}
          className={cn(
            "bg-white/70 dark:bg-white/5 backdrop-blur-xl border rounded-3xl p-6 shadow-sm transition-all cursor-pointer group",
            expandedCard === 'balance' 
              ? "border-blue-500/50 ring-1 ring-blue-500/30 bg-white/90 dark:bg-white/10" 
              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  {periodScope === 'currentMonth' ? 'Saldo Real do Mês' : 'Saldo Geral Acumulado'}
                </h3>
                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  {expandedCard === 'balance' ? 'Recolher mini-extrato' : 'Clique para mini-extrato'}
                </span>
              </div>
            </div>

            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 transition-transform duration-300",
              expandedCard === 'balance' && "rotate-180 bg-blue-500/20 text-blue-600 dark:text-blue-300"
            )}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2 mb-1">
            <p className={cn(
              "text-3xl font-extrabold tracking-tight",
              currentMonthStats.balance >= 0 
                ? "text-slate-900 dark:text-white" 
                : "text-rose-600 dark:text-rose-400"
            )}>
              {formatCurrency(currentMonthStats.balance)}
            </p>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full",
              currentMonthStats.balance >= 0 ? "bg-emerald-500" : "bg-rose-500"
            )} />
            <span>
              {periodScope === 'currentMonth' 
                ? `${currentMonthStats.count} movimentações registradas neste mês`
                : `${scopedTransactions.length} movimentações no histórico`}
            </span>
          </p>

          <AnimatePresence>
            {expandedCard === 'balance' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 mt-4 border-t border-slate-200/70 dark:border-white/10 space-y-2.5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>Últimos Lançamentos</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">Mini-Extrato</span>
                </div>

                {recentBalanceItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhum lançamento no período selecionado.</p>
                ) : (
                  recentBalanceItems.map(item => {
                    const srcInfo = getSourceInfo(item.source);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs transition-colors">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-500">
                              {format(parseISO(item.date), "dd/MM")} • {item.category}
                            </span>
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex items-center gap-0.5",
                              srcInfo.badgeClass
                            )}>
                              <span>{srcInfo.icon}</span>
                              <span>{srcInfo.label}</span>
                            </span>
                          </div>
                        </div>
                        <span className={cn("font-bold whitespace-nowrap", item.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                        </span>
                      </div>
                    );
                  })
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todos os lançamentos</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card 2: Receitas (Entradas do Mês) */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          onClick={() => toggleCard('income')}
          className={cn(
            "bg-white/70 dark:bg-white/5 backdrop-blur-xl border rounded-3xl p-6 shadow-sm transition-all cursor-pointer group",
            expandedCard === 'income' 
              ? "border-emerald-500/50 ring-1 ring-emerald-500/30 bg-white/90 dark:bg-white/10" 
              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  {periodScope === 'currentMonth' ? 'Receitas do Mês' : 'Receitas Totais'}
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  {expandedCard === 'income' ? 'Recolher entradas' : 'Clique para entradas'}
                </span>
              </div>
            </div>

            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 transition-transform duration-300",
              expandedCard === 'income' && "rotate-180 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
            )}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 tracking-tight">
            +{formatCurrency(currentMonthStats.income)}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Valores creditados identificando a origem (Salário, Benefício, Extra)
          </p>

          <AnimatePresence>
            {expandedCard === 'income' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 mt-4 border-t border-slate-200/70 dark:border-white/10 space-y-2.5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>Últimas Entradas</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Receitas</span>
                </div>

                {recentIncomeItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhuma receita registrada neste período.</p>
                ) : (
                  recentIncomeItems.map(item => {
                    const srcInfo = getSourceInfo(item.source);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs transition-colors">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <ArrowUpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-500">{format(parseISO(item.date), "dd/MM")}</span>
                              <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex items-center gap-0.5",
                                srcInfo.badgeClass
                              )}>
                                <span>{srcInfo.icon}</span>
                                <span>Entrou em: {srcInfo.label}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          +{formatCurrency(item.amount)}
                        </span>
                      </div>
                    );
                  })
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todas as receitas</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card 3: Despesas (Saídas do Mês) */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          onClick={() => toggleCard('expense')}
          className={cn(
            "bg-white/70 dark:bg-white/5 backdrop-blur-xl border rounded-3xl p-6 shadow-sm transition-all cursor-pointer group",
            expandedCard === 'expense' 
              ? "border-rose-500/50 ring-1 ring-rose-500/30 bg-white/90 dark:bg-white/10" 
              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  {periodScope === 'currentMonth' ? 'Despesas do Mês' : 'Despesas Totais'}
                </h3>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                  {expandedCard === 'expense' ? 'Recolher saídas' : 'Clique para saídas'}
                </span>
              </div>
            </div>

            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 transition-transform duration-300",
              expandedCard === 'expense' && "rotate-180 bg-rose-500/20 text-rose-600 dark:text-rose-300"
            )}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mb-1 tracking-tight">
            -{formatCurrency(currentMonthStats.expense)}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Gastos debitados identificando a origem que cobriu a despesa
          </p>

          <AnimatePresence>
            {expandedCard === 'expense' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 mt-4 border-t border-slate-200/70 dark:border-white/10 space-y-2.5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>Últimas Saídas</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-semibold">Despesas</span>
                </div>

                {recentExpenseItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhuma despesa registrada neste período.</p>
                ) : (
                  recentExpenseItems.map(item => {
                    const srcInfo = getSourceInfo(item.source);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs transition-colors">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <ArrowDownCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-500">{format(parseISO(item.date), "dd/MM")}</span>
                              <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex items-center gap-0.5",
                                srcInfo.badgeClass
                              )}>
                                <span>{srcInfo.icon}</span>
                                <span>Saiu de: {srcInfo.label}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          -{formatCurrency(item.amount)}
                        </span>
                      </div>
                    );
                  })
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todas as despesas</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* NEW SECTION: Situação Real & Disponibilidade por Fonte de Recursos */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Disponibilidade Real por Fonte ({periodScope === 'currentMonth' ? 'Mês Atual' : 'Geral'})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Veja quanto dinheiro realmente resta em cada carteira: salário, vales alimentação/refeição ou rendas extras.
            </p>
          </div>

          {selectedSourceFilter && (
            <button
              onClick={() => setSelectedSourceFilter(null)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Remover filtro de fonte</span>
            </button>
          )}
        </div>

        {/* Source Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sourcesBreakdown.map((item) => {
            const isSelected = selectedSourceFilter === item.source;
            const isPositive = item.balance >= 0;

            return (
              <div
                key={item.source}
                onClick={() => setSelectedSourceFilter(isSelected ? null : item.source)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                  isSelected
                    ? "ring-2 ring-emerald-500 bg-white dark:bg-white/10 shadow-md"
                    : "bg-slate-50/80 dark:bg-white/5 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10"
                )}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0">{item.info.icon}</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                      {item.info.label}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                    isPositive 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                  )}>
                    {isPositive ? 'Positivo' : 'Excedeu'}
                  </span>
                </div>

                {/* Available Balance in this source */}
                <div className="my-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Saldo Disponível
                  </span>
                  <p className={cn(
                    "text-xl font-black tracking-tight",
                    isPositive ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {formatCurrency(item.balance)}
                  </p>
                </div>

                {/* Inflow vs Outflow details */}
                <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ArrowUpCircle className="w-3 h-3" /> Entrou:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      +{formatCurrency(item.income)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                      <ArrowDownCircle className="w-3 h-3" /> Saiu:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      -{formatCurrency(item.expense)}
                    </span>
                  </div>
                </div>

                {/* Visual consumption progress bar (for benefits like VA/VR and salary) */}
                {item.income > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-1">
                      <span>{item.percentageUsed}% utilizado</span>
                      <span>{100 - item.percentageUsed}% restante</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.percentageUsed > 90 
                            ? "bg-rose-500" 
                            : item.percentageUsed > 60 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                        )}
                        style={{ width: `${item.percentageUsed}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Next Steps / Pending & AI Bot Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Steps / Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Próximos Passos & Previsões</span>
            </h3>
          </div>
          
          {(pendingStats.pIncome > 0 || pendingStats.pExpense > 0) && (
            <div className="flex flex-wrap gap-2 mb-4 text-xs sm:text-sm">
              {pendingStats.pIncome > 0 && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
                  + {formatCurrency(pendingStats.pIncome)} a receber
                </span>
              )}
              {pendingStats.pExpense > 0 && (
                <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full font-semibold">
                  - {formatCurrency(pendingStats.pExpense)} a pagar
                </span>
              )}
            </div>
          )}

          <div className="space-y-3 flex-1">
            {pendingTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Nenhum lançamento pendente. Tá tudo em dia! 🎉
                </p>
              </div>
            ) : (
              pendingTransactions.map(t => {
                const canConfirm = !isFuture(parseISO(t.date));
                const srcInfo = getSourceInfo(t.source);

                return (
                  <div key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">
                          {format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })} • {t.category}
                        </span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex items-center gap-0.5",
                          srcInfo.badgeClass
                        )}>
                          <span>{srcInfo.icon}</span>
                          <span>{srcInfo.label}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("font-extrabold text-sm sm:text-base", t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      {canConfirm ? (
                        <button
                          onClick={() => confirmTransaction(t.id)}
                          className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                          title="Confirmar Lançamento"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded-md font-bold">
                          Futuro
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick Tips or Info / AI Bot Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={handleGoToChat}
          className="bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/25 p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all cursor-pointer hover:border-emerald-500/50 hover:shadow-md group active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Dica de Especialista</span>
              </h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Assessor IA
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              Separar de onde sai cada gasto (como compras no VA e refeições diárias no VR) evita que despesas básicas corroam seu salário principal. Consulte o Assessor IA para equilibrar seus orçamentos por fonte!
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoToChat();
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300 border border-transparent dark:border-emerald-500/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group-hover:translate-x-1 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Analisar Gastos com o Assessor IA</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Extrato Bancário Modal */}
      <BankStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </div>
  );
}
