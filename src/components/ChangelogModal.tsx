import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Camera, 
  FileText, 
  LayoutDashboard, 
  Fingerprint, 
  Pencil, 
  ShoppingCart, 
  Bot, 
  ShieldCheck, 
  CheckCircle2,
  Tag
} from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  const updates = [
    {
      icon: Camera,
      badge: 'IA Vision',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      title: 'Leitura de Comprovantes e Notas Fiscais com IA',
      description: 'Envie uma foto ou use a câmera para que o Gemini extraia automaticamente o estabelecimento, valor total, categoria e data do lançamento.'
    },
    {
      icon: FileText,
      badge: 'Relatórios',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      title: 'Geração de Extrato Bancário Detalhado',
      description: 'Extrato financeiro com filtros por período (7d, 15d, 30d, mês), balanço consolidado de entradas e saídas e opção de impressão/PDF.'
    },
    {
      icon: LayoutDashboard,
      badge: 'Dashboard',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      title: 'Cards Expansíveis com Mini-Extrato',
      description: 'Clique nos cards de Saldo Atual, Receitas ou Despesas para expandir os últimos lançamentos relacionados instantaneamente.'
    },
    {
      icon: Fingerprint,
      badge: 'Segurança',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      title: 'Bloqueio do App por Biometria & PIN',
      description: 'Proteção de privacidade usando a biometria nativa do seu dispositivo (Impressão Digital / Face ID) e PIN de segurança de contingência.'
    },
    {
      icon: Pencil,
      badge: 'Lançamentos',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      title: 'Edição Rápida e Confirmação de Pendências',
      description: 'Edite valores e categorias com facilidade e confirme recebimentos ou pagamentos agendados em um clique.'
    },
    {
      icon: ShoppingCart,
      badge: 'Mercado',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      title: 'Carrinho & Calculadora de Custo Unitário',
      description: 'Descubra qual produto compensa mais comparando embalagens por kg, gramas, litros e unidades durante suas compras.'
    },
    {
      icon: Bot,
      badge: 'Consultoria',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      title: 'Assessor Financeiro com Inteligência Artificial',
      description: 'Tire dúvidas financeiras, receba dicas de economia e monte estratégias para suas metas de reserva de emergência e investimentos.'
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sobre a Versão</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                    v2.1 PRO
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Novidades e melhorias aplicadas na plataforma
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with Features List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Você está utilizando a versão mais recente e estável do <strong>Assessoria Financeira Pro</strong>, com sincronização em nuvem e inteligência artificial integrada.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Principais Atualizações
              </h4>

              {updates.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sistema atualizado</span>
            </div>
            
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
