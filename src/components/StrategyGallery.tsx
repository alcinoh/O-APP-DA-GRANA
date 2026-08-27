import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Library, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function StrategyGallery() {
  const { strategies, deleteStrategy } = useAppContext();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta estratégia?')) {
      await deleteStrategy(id);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Data recente';
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
          <Library className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Galeria de Estratégias
        </h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">Planos e orientações financeiras geradas pelo Assessor IA.</p>
      </header>

      {strategies.length === 0 ? (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm transition-colors">
          <Library className="w-16 h-16 text-emerald-600/20 dark:text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhuma estratégia salva ainda</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Converse com o Assessor IA e clique no botão <strong>"Salvar Estratégia"</strong> abaixo de qualquer resposta para guardá-la aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col transition-all hover:border-emerald-500/30"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold mb-2 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {strategy.type || 'Assessor IA'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{strategy.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(strategy.id, strategy.content)}
                    className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    title="Copiar Conteúdo"
                  >
                    {copiedId === strategy.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(strategy.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    title="Excluir Estratégia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {strategy.description && strategy.description !== strategy.title && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {strategy.description}
                </p>
              )}
              
              <div className="bg-slate-100/60 dark:bg-black/30 rounded-2xl p-4 border border-slate-200/80 dark:border-white/5 overflow-y-auto max-h-[260px] custom-scrollbar text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed flex-1">
                {strategy.content}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{formatDateSafe(strategy.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


