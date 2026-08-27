import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Library, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export function StrategyGallery() {
  const { strategies, user } = useAppContext();

  const deleteStrategy = async (id: string) => {
    if (!user) return;
    if (confirm('Tem certeza que deseja excluir esta estratégia?')) {
      await deleteDoc(doc(db, `users/${user.uid}/strategies/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
          <Library className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Galeria de Estratégias
        </h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">Planos e dicas gerados pela IA para a sua carteira.</p>
      </header>

      {strategies.length === 0 ? (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm transition-colors">
          <Library className="w-16 h-16 text-emerald-600/20 dark:text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhuma estratégia ainda</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Use o carrinho de compras ou converse com o Assessor IA para gerar novos planos financeiros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold mb-2 inline-block">
                    {strategy.type}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{strategy.title}</h3>
                </div>
                <button 
                  onClick={() => deleteStrategy(strategy.id)}
                  className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                {strategy.description}
              </p>
              
              <div className="bg-slate-100/50 dark:bg-black/20 rounded-xl p-4 border border-slate-200 dark:border-white/5 overflow-y-auto max-h-[300px] custom-scrollbar text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                {strategy.content}
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                Criado em: {format(parseISO(strategy.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
