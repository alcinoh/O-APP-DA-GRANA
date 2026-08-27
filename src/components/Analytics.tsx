import React from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function Analytics() {
  const { transactions, theme } = useAppContext();

  // Group by month
  const monthlyData = transactions.reduce((acc: any, t) => {
    if (t.status !== 'Confirmado') return acc;
    
    const month = format(parseISO(t.date), "MMM/yy", { locale: ptBR });
    if (!acc[month]) {
      acc[month] = { name: month, Receitas: 0, Despesas: 0 };
    }
    
    if (t.type === 'income') {
      acc[month].Receitas += t.amount;
    } else {
      acc[month].Despesas += t.amount;
    }
    return acc;
  }, {});

  const data = Object.values(monthlyData);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
          <BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Análise Mensal
        </h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">Acompanhe a evolução das suas finanças.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Receitas vs Despesas</h3>
        
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            Não há dados suficientes para gerar o gráfico. Confirme algumas transações primeiro!
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#0f172a' : '#f1f5f9' }}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#020617' : '#ffffff', 
                    borderRadius: '16px', 
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                    color: isDark ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: isDark ? '#cbd5e1' : '#475569' }} />
                <Bar dataKey="Receitas" fill={isDark ? "#34d399" : "#10b981"} radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Despesas" fill={isDark ? "#fb7185" : "#f43f5e"} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}
