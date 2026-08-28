import React, { useState } from 'react';
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
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseISO, isFuture, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './Layout';
import { BankStatementModal } from './BankStatementModal';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  onNavigateToChat?: () => void;
}

export function Dashboard({ setActiveTab, onNavigateToChat }: DashboardProps) {
  const { 
    balance, 
    totalIncome, 
    totalExpense, 
    pendingIncome, 
    pendingExpense, 
    transactions, 
    confirmTransaction, 
    isHydrating 
  } = useAppContext();

  const [expandedCard, setExpandedCard] = useState<'balance' | 'income' | 'expense' | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

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

  const pendingTransactions = transactions
    .filter(t => t.status === 'Pendente')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const toggleCard = (cardType: 'balance' | 'income' | 'expense') => {
    setExpandedCard(prev => prev === cardType ? null : cardType);
  };

  // Mini-extratos para cada card
  const recentBalanceItems = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const recentIncomeItems = transactions
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const recentExpenseItems = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {isHydrating && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm shadow-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Sincronizando seus dados com o Firebase em tempo real...</span>
        </motion.div>
      )}

      {/* Header with Extrato Button */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Visão Geral</h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">Acompanhe como está sua carteira hoje.</p>
        </div>

        <button
          onClick={() => setIsStatementModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Gerar Extrato</span>
        </button>
      </header>

      {/* Expandable Interactive Cards (Accordion) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Card 1: Saldo Atual */}
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Saldo Atual</h3>
                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  Clique para mini-extrato
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

          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(balance)}</p>

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
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhum lançamento registrado.</p>
                ) : (
                  recentBalanceItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                        <p className="text-[10px] text-slate-500">{format(parseISO(item.date), "dd/MM")} • {item.category}</p>
                      </div>
                      <span className={cn("font-bold whitespace-nowrap", item.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todos os lançamentos</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card 2: Receitas */}
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Receitas</h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  Clique para entradas
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

          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{formatCurrency(totalIncome)}</p>

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
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhuma receita registrada.</p>
                ) : (
                  recentIncomeItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                          <p className="text-[10px] text-slate-500">{format(parseISO(item.date), "dd/MM")} • {item.category}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todas as receitas</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card 3: Despesas */}
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Despesas</h3>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                  Clique para saídas
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

          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">{formatCurrency(totalExpense)}</p>

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
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhuma despesa registrada.</p>
                ) : (
                  recentExpenseItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                          <p className="text-[10px] text-slate-500">{format(parseISO(item.date), "dd/MM")} • {item.category}</p>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        -{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))
                )}

                <button
                  onClick={handleGoToTransactions}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ver todas as despesas</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Next Steps / Pending & AI Bot Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Next Steps / Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Próximos Passos
            </h3>
          </div>
          
          {(pendingIncome > 0 || pendingExpense > 0) && (
            <div className="flex flex-wrap gap-2 mb-6 text-xs sm:text-sm">
              {pendingIncome > 0 && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full font-medium">+ {formatCurrency(pendingIncome)} a receber</span>}
              {pendingExpense > 0 && <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full font-medium">- {formatCurrency(pendingExpense)} a pagar</span>}
            </div>
          )}

          <div className="space-y-3">
            {pendingTransactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhum lançamento pendente. Tá tudo em dia! 🎉</p>
            ) : (
              pendingTransactions.map(t => {
                const canConfirm = !isFuture(parseISO(t.date));
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })} • {t.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("font-bold text-sm sm:text-base", t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      {canConfirm ? (
                        <button
                          onClick={() => confirmTransaction(t.id)}
                          className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                          title="Confirmar Lançamento"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded font-bold">Futuro</span>
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
          className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all cursor-pointer hover:border-emerald-400/60 dark:hover:border-emerald-400/40 hover:shadow-md group active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <span>Dica do dia</span>
              </h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Assessor IA
              </span>
            </div>
            <p className="text-emerald-950/80 dark:text-slate-300 text-sm leading-relaxed">
              Sabia que separar pelo menos 10% da sua renda para reservas de emergência pode te salvar de perrengues no futuro? Bora começar!
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoToChat();
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300 border border-transparent dark:border-emerald-500/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group-hover:translate-x-1"
            >
              <Bot className="w-4 h-4" />
              <span>Fale com a IA para mais dicas</span>
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
