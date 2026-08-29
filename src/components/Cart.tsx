import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, ShoppingCart, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './Layout';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function Cart() {
  const { cart, addToCart, updateCartItem, removeFromCart, clearCart, addTransaction, addStrategy } = useAppContext();
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addToCart({
      name,
      price: 0,
      quantity: 1,
    });

    setName('');
  };

  const handleCheckout = async () => {
    const pickedItems = cart.filter(item => item.picked);
    if (pickedItems.length === 0) return;

    setIsProcessing(true);
    const total = pickedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    try {
      // 1. Add transaction
      await addTransaction({
        type: 'expense',
        category: 'Mercado',
        description: 'Compra de Mercado',
        amount: total,
        date: new Date().toISOString(),
      });

      // 2. Call Gemini AI
      const API_KEY = "AIzaSyCvVKTlv8XupcF8aMy2ncRgbJGK3cc_F88";
      const itemsText = pickedItems.map(i => `- ${i.quantity}x ${i.name} (R$ ${i.price.toFixed(2)} cada)`).join('\n');
      
      const prompt = `Você é um Assessor Financeiro focado em Finanças Pessoais. 
Seu cliente acabou de fazer a seguinte compra no mercado (Total: R$ ${total.toFixed(2)}):
${itemsText}

Analise a compra. Ele economizou? A compra foi boa? Dê dicas curtas e diretas sobre o que ele pode substituir na próxima vez para poupar mais.
Seja empático, use uma linguagem jovem e direta do Brasil (ex: "E aí, bora organizar a grana?").`;

      let aiFeedback = "Análise concluída com sucesso!";
      
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const response = await model.generateContent(prompt);
        
        if (response.response.text()) {
          aiFeedback = response.response.text();
        } else {
          aiFeedback = "O Assistente analisou sua compra, mas não gerou observações adicionais desta vez.";
        }
      } catch (err) {
        console.error("Erro na chamada do Gemini API (Cart):", err);
        aiFeedback = "Análise concluída! No entanto, o assistente de IA falhou ao gerar os insights detalhados neste momento. O seu gasto já foi contabilizado e salvo nas estratégias.";
      }

      // 3. Save Strategy/Feedback
      await addStrategy({
        title: `Análise de Mercado - ${format(new Date(), 'dd/MM/yyyy')}`,
        type: 'Análise de Compras',
        description: `Gasto total: ${formatCurrency(total)}`,
        content: aiFeedback
      });

      // 4. Remove picked items from cart
      for (const item of pickedItems) {
        await removeFromCart(item.id);
      }
      
      alert('Compra concluída! Uma nova análise de IA foi salva nas suas Estratégias.');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar compra.');
    } finally {
      setIsProcessing(false);
    }
  };

  const total = cart.filter(i => i.picked).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const pendingCount = cart.filter(i => !i.picked).length;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
          <ShoppingCart className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Lista de Compras Inteligente
        </h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">Planeje em casa, confira no mercado e deixe a IA analisar.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Planning */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">1. O que você precisa comprar?</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Ex: Arroz, Leite..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-[2] px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                required
              />
              <button
                type="submit"
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center font-bold gap-2 shrink-0"
              >
                <Plus className="w-5 h-5" /> Adicionar à Lista
              </button>
            </form>
          </div>

          {/* Step 2: Market */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">2. No Mercado</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors">Marque os itens que pegou e insira o preço real.</p>
            </div>
            
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Sua lista está vazia.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-white/5 transition-colors">
                {cart.map(item => (
                  <div key={item.id} className={cn(
                    "p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors",
                    item.picked ? "bg-emerald-50 dark:bg-emerald-500/5" : "hover:bg-slate-100 dark:hover:bg-white/5"
                  )}>
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => updateCartItem(item.id, { picked: !item.picked })}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                          item.picked ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/20 text-transparent hover:border-emerald-400"
                        )}
                      >
                        {item.picked && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <div className="flex-1">
                        <p className={cn("font-bold text-lg", item.picked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>{item.name}</p>
                      </div>
                    </div>
                    
                    {item.picked && (
                      <div className="flex items-center gap-3 pl-12 md:pl-0">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Preço"
                          value={item.price || ''}
                          onChange={(e) => updateCartItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:border-emerald-500/50 outline-none text-right transition-colors"
                        />
                        <span className="text-slate-500">x</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.id, { quantity: parseInt(e.target.value, 10) || 1 })}
                          className="w-16 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:border-emerald-500/50 outline-none text-center transition-colors"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-4 pl-12 md:pl-0">
                      {item.picked && (
                        <div className="w-24 text-right font-bold text-slate-900 dark:text-white hidden md:block transition-colors">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      )}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 p-6 rounded-3xl shadow-md sticky top-6 transition-colors"
          >
            <h3 className="text-emerald-700 dark:text-emerald-400 text-sm mb-1 transition-colors">Total do Carrinho</h3>
            <p className="text-4xl font-bold mb-6 text-emerald-900 dark:text-white transition-colors">{formatCurrency(total)}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-emerald-800 dark:text-slate-300 text-sm border-b border-emerald-200 dark:border-emerald-500/20 pb-2 transition-colors">
                <span>Itens Pegos</span>
                <span className="font-bold">{cart.filter(i => i.picked).reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 dark:text-slate-300 text-sm border-b border-emerald-200 dark:border-emerald-500/20 pb-2 transition-colors">
                <span>Faltam Pegar</span>
                <span className="font-bold text-amber-600 dark:text-yellow-400">{pendingCount}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing || cart.filter(i => i.picked).length === 0}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mb-3"
            >
              {isProcessing ? (
                'Analisando...'
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Compra Concluída
                </>
              )}
            </button>
            <p className="text-xs text-emerald-700 dark:text-slate-400 text-center transition-colors">
              Ao concluir, os itens pegos viram uma despesa e a IA analisará suas compras.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
