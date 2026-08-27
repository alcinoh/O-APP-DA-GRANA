import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseISO, format, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './Layout';
import { Transaction } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function Transactions() {
  const { transactions, addTransaction, deleteTransaction, confirmTransaction } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    addTransaction({
      type,
      description,
      amount: parseFloat(amount),
      category,
      date,
    });

    setDescription('');
    setAmount('');
    setCategory('');
    setIsFormOpen(false);
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Lançamentos</h2>
          <p className="text-slate-400">Gerencie suas receitas e despesas.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </header>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex bg-black/20 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      type === 'expense' ? "bg-white/10 text-rose-400 border border-white/5" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      type === 'income' ? "bg-white/10 text-emerald-400 border border-white/5" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Receita
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Descrição (ex: Mercado, Salário)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all bg-black/20 text-white placeholder:text-slate-500"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor (R$)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all bg-black/20 text-white placeholder:text-slate-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Categoria (ex: Alimentação)"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all bg-black/20 text-white placeholder:text-slate-500"
                    required
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all bg-black/20 text-white [color-scheme:dark]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum lançamento encontrado. Crie um novo acima!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedTransactions.map(t => {
              const isFut = isFuture(parseISO(t.date));
              const canConfirm = t.status === 'Pendente' && !isFut;

              return (
                <div key={t.id} className="p-4 md:px-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      t.type === 'income' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{format(parseISO(t.date), "dd/MM/yyyy")}</span>
                        <span>•</span>
                        <span className="bg-white/10 border border-white/5 px-2 py-0.5 rounded text-slate-300">{t.category}</span>
                        {t.status === 'Pendente' && (
                          <>
                            <span>•</span>
                            <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded uppercase tracking-wider font-bold">Pendente</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "font-bold text-lg",
                      t.type === 'income' ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      {canConfirm && (
                        <button
                          onClick={() => confirmTransaction(t.id)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30"
                          title="Confirmar pagamento/recebimento"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
