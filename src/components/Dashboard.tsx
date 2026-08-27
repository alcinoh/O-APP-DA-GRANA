import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle2, Bot, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { parseISO, isFuture, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './Layout';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  onNavigateToChat?: () => void;
}

export function Dashboard({ setActiveTab, onNavigateToChat }: DashboardProps) {
  const { balance, totalIncome, totalExpense, pendingIncome, pendingExpense, transactions, confirmTransaction, isHydrating } = useAppContext();

  const handleGoToChat = () => {
    if (onNavigateToChat) {
      onNavigateToChat();
    } else if (setActiveTab) {
      setActiveTab('chat');
    }
  };

  const pendingTransactions = transactions
    .filter(t => t.status === 'Pendente')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const StatCard = ({ title, amount, icon: Icon, color, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm transition-colors"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color.bg)}>
          <Icon className={cn("w-6 h-6", color.text)} />
        </div>
        <h3 className="text-slate-600 dark:text-slate-400 text-sm">{title}</h3>
      </div>
      <p className={cn("text-3xl font-bold", color.amountText || "text-slate-900 dark:text-white")}>{formatCurrency(amount)}</p>
    </motion.div>
  );

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

      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Visão Geral</h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">Acompanhe como está sua carteira hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Saldo Atual"
          amount={balance}
          icon={Wallet}
          color={{ bg: "bg-blue-500/10 border border-blue-500/20", text: "text-blue-500 dark:text-blue-400", amountText: "text-slate-900 dark:text-white" }}
          delay={0}
        />
        <StatCard
          title="Receitas"
          amount={totalIncome}
          icon={TrendingUp}
          color={{ bg: "bg-emerald-500/10 border border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", amountText: "text-emerald-600 dark:text-emerald-400" }}
          delay={0.1}
        />
        <StatCard
          title="Despesas"
          amount={totalExpense}
          icon={TrendingDown}
          color={{ bg: "bg-rose-500/10 border border-rose-500/20", text: "text-rose-600 dark:text-rose-400", amountText: "text-rose-600 dark:text-rose-400" }}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Next Steps / Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Próximos Passos
            </h3>
          </div>
          
          {(pendingIncome > 0 || pendingExpense > 0) && (
            <div className="flex gap-4 mb-6 text-sm">
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
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{t.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })} • {t.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("font-bold", t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
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
          transition={{ delay: 0.4 }}
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
    </div>
  );
}
