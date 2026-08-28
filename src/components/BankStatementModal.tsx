import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Printer, Copy, Check, TrendingUp, TrendingDown, Wallet, Calendar, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { parseISO, format, isAfter, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';
import { cn } from './Layout';

interface BankStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PeriodFilter = '7days' | '15days' | '30days' | 'currentMonth' | 'all';
type TypeFilter = 'all' | 'income' | 'expense';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const BankStatementModal: React.FC<BankStatementModalProps> = ({ isOpen, onClose }) => {
  const { transactions, user } = useAppContext();
  const [period, setPeriod] = useState<PeriodFilter>('30days');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [copied, setCopied] = useState(false);

  const now = useMemo(() => new Date(), []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = parseISO(t.date);

      // Period filter
      let matchesPeriod = true;
      if (period === '7days') {
        matchesPeriod = isAfter(txDate, subDays(now, 7));
      } else if (period === '15days') {
        matchesPeriod = isAfter(txDate, subDays(now, 15));
      } else if (period === '30days') {
        matchesPeriod = isAfter(txDate, subDays(now, 30));
      } else if (period === 'currentMonth') {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        matchesPeriod = isWithinInterval(txDate, { start, end });
      }

      // Type filter
      let matchesType = true;
      if (typeFilter === 'income') matchesType = t.type === 'income';
      if (typeFilter === 'expense') matchesType = t.type === 'expense';

      return matchesPeriod && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, period, typeFilter, now]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7days': return 'Últimos 7 dias';
      case '15days': return 'Últimos 15 dias';
      case '30days': return 'Últimos 30 dias';
      case 'currentMonth': return `Mês Atual (${format(now, 'MMMM yyyy', { locale: ptBR })})`;
      case 'all': return 'Todo o Período';
    }
  }, [period, now]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `📊 *EXTRATO FINANCEIRO - ASSESSORIA*
👤 Usuário: ${user?.name || 'Titular'}
📅 Período: ${periodLabel}
🗓 Emissão: ${format(now, "dd/MM/yyyy 'às' HH:mm")}

💰 *Resumo:*
🟢 Entradas: +${formatCurrency(stats.income)}
🔴 Saídas: -${formatCurrency(stats.expense)}
⚖️ Saldo do Período: ${stats.balance >= 0 ? '+' : ''}${formatCurrency(stats.balance)}
📝 Total de Lançamentos: ${stats.count}

${filteredTransactions.slice(0, 15).map(t => `${format(parseISO(t.date), "dd/MM")}: ${t.type === 'income' ? '🟢 +' : '🔴 -'}${formatCurrency(t.amount)} (${t.description})`).join('\n')}
${filteredTransactions.length > 15 ? `... e mais ${filteredTransactions.length - 15} lançamentos` : ''}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6 transition-colors"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Extrato Financeiro</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Emitido em {format(now, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-6 space-y-4 border-b border-slate-200 dark:border-white/10 bg-slate-100/40 dark:bg-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                  <Calendar className="w-3.5 h-3.5" /> Período:
                </span>
                {(
                  [
                    { id: '7days', label: '7 Dias' },
                    { id: '15days', label: '15 Dias' },
                    { id: '30days', label: '30 Dias' },
                    { id: 'currentMonth', label: 'Mês Atual' },
                    { id: 'all', label: 'Tudo' },
                  ] as { id: PeriodFilter; label: string }[]
                ).map(btn => (
                  <button
                    key={btn.id}
                    onClick={() => setPeriod(btn.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg whitespace-nowrap transition-all",
                      period === btn.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Tipo:
                </span>
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'income', label: 'Receitas' },
                    { id: 'expense', label: 'Despesas' },
                  ] as { id: TypeFilter; label: string }[]
                ).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all",
                      typeFilter === t.id
                        ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                  <TrendingUp className="w-4 h-4" /> Entradas
                </div>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">+{formatCurrency(stats.income)}</p>
              </div>
              <div className="p-3.5 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-1">
                  <TrendingDown className="w-4 h-4" /> Saídas
                </div>
                <p className="text-lg font-black text-rose-700 dark:text-rose-400">-{formatCurrency(stats.expense)}</p>
              </div>
              <div className="p-3.5 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-1">
                  <Wallet className="w-4 h-4" /> Resultado do Período
                </div>
                <p className={cn("text-lg font-black", stats.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-rose-600 dark:text-rose-400")}>
                  {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-200/70 dark:divide-white/5 p-2 sm:p-4">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                Nenhum lançamento encontrado para o período selecionado ({periodLabel}).
              </div>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs",
                      t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    )}>
                      {t.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="whitespace-nowrap">{format(parseISO(t.date), "dd/MM/yyyy")}</span>
                        <span>•</span>
                        <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.2 rounded text-slate-700 dark:text-slate-300 font-medium">{t.category}</span>
                        {t.status === 'Pendente' && (
                          <span className="text-[10px] px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded uppercase font-bold">Pendente</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn(
                      "font-bold text-sm sm:text-base",
                      t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando <strong className="text-slate-800 dark:text-slate-200">{filteredTransactions.length}</strong> registro(s)
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopySummary}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
