import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bot, Send, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './Layout';
import { getGemini } from '../lib/gemini';

export function AIChat() {
  const { chatHistory, addChatMessage, clearChat, balance, totalIncome, totalExpense, transactions } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "COLE_SUA_CHAVE_AQUI" || apiKey.trim() === "") {
        console.error("VITE_GEMINI_API_KEY não foi encontrada nas variáveis de ambiente!");
        addChatMessage({
          role: 'model',
          content: '⚠️ Chave da API do Gemini não configurada! Adicione a variável `VITE_GEMINI_API_KEY` no seu arquivo `.env` ou nas configurações do projeto para ativar o Assessor de IA.'
        });
        return;
      }

      const context = `Contexto Financeiro do Usuário:
Saldo Atual: R$ ${balance.toFixed(2)}
Receitas Totais: R$ ${totalIncome.toFixed(2)}
Despesas Totais: R$ ${totalExpense.toFixed(2)}
Últimos Lançamentos: ${transactions.slice(-5).map(t => `${t.description} (${t.type === 'income' ? '+' : '-'}${t.amount})`).join(', ')}`;

      const prompt = `Você é um Assessor Financeiro de Finanças Pessoais. Responda à dúvida do usuário de forma concisa, educada e direta, como se estivesse conversando no WhatsApp. Use linguagem coloquial do Brasil ("E aí", "bora", etc).
${context}

Mensagem do Usuário: ${userMsg}`;

      const ai = getGemini();
      // Try gemini-2.5-flash then fallback to gemini-1.5-flash
      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        responseText = response.text || "";
      } catch {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
        responseText = fallbackResponse.text || "";
      }

      if (!responseText) {
        responseText = "Desculpe, não consegui formular uma resposta agora.";
      }
      addChatMessage({ role: 'model', content: responseText });
    } catch (error) {
      console.error("Erro na comunicação com a API do Gemini:", error);
      addChatMessage({ 
        role: 'model', 
        content: 'Ops, ocorreu um erro de conexão com a IA! Verifique se a variável VITE_GEMINI_API_KEY está válida no seu .env.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-100px)]">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Bot className="w-7 h-7 text-emerald-400" />
            Assessor IA
          </h2>
          <p className="text-slate-400 text-sm">Tire dúvidas e receba dicas personalizadas.</p>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="text-slate-500 hover:text-rose-400 transition-colors p-2"
            title="Limpar Histórico"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
              <Bot className="w-16 h-16 text-emerald-500 mb-4" />
              <p className="text-slate-200 font-bold">E aí! Sou seu assessor financeiro.</p>
              <p className="text-sm text-slate-400 mt-2">Pergunta aí sobre seu saldo, dicas para economizar ou como organizar sua grana.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === 'user' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white border border-white/10"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl",
                    msg.role === 'user' 
                      ? "bg-emerald-500 text-white rounded-tr-sm" 
                      : "bg-white/10 border border-white/10 text-slate-200 rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white border border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white/10 border border-white/10 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full px-5 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 pr-14 bg-white/5 text-white placeholder:text-slate-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
