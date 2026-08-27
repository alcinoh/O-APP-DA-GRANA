import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bot, Send, User, Trash2, Loader2 } from 'lucide-react';
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
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    // 1. Limpa o input imediatamente e adiciona ao estado da conversa
    setInput('');
    setIsLoading(true);

    try {
      await addChatMessage({ role: 'user', content: userMsg });

      // 2. Verifica a chave de API
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "COLE_SUA_CHAVE_AQUI" || apiKey.trim() === "") {
        console.error("VITE_GEMINI_API_KEY não foi encontrada nas variáveis de ambiente!");
        await addChatMessage({
          role: 'model',
          content: '⚠️ Chave da API do Gemini não configurada! Para conversar com o Assessor de IA, adicione a variável `VITE_GEMINI_API_KEY` com a sua chave do Google AI Studio no arquivo `.env`.'
        });
        return;
      }

      // 3. Monta o contexto financeiro real do usuário
      const context = `Contexto Financeiro Atual do Usuário:
- Saldo em Conta: R$ ${balance.toFixed(2)}
- Receitas Totais: R$ ${totalIncome.toFixed(2)}
- Despesas Totais: R$ ${totalExpense.toFixed(2)}
- Últimos 5 Lançamentos: ${transactions.length > 0 ? transactions.slice(-5).map(t => `${t.description} (${t.type === 'income' ? '+' : '-'}R$ ${t.amount.toFixed(2)})`).join(', ') : 'Nenhum lançamento cadastrado ainda'}`;

      const prompt = `Você é o Assessor de Finanças Pessoais do aplicativo "Acessoria". Responda de forma prática, acolhedora e direta, como um amigo experiente em educação financeira no WhatsApp. Use linguagem coloquial e natural do Brasil (ex: "E aí!", "Bora organizar", etc).

${context}

Pergunta / Mensagem do Usuário: "${userMsg}"`;

      // 4. Executa a requisição ao Gemini com fallback seguro
      const ai = getGemini();
      let responseText = "";

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        responseText = response.text || "";
      } catch (genError) {
        console.warn("Tentando fallback com gemini-1.5-flash após erro:", genError);
        try {
          const fallback = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
          });
          responseText = fallback.text || "";
        } catch (errFallback) {
          console.error("Erro no modelo fallback Gemini:", errFallback);
          throw genError;
        }
      }

      if (!responseText.trim()) {
        responseText = "Desculpe, não consegui gerar uma resposta neste momento. Poderia perguntar novamente de outra forma?";
      }

      // 5. Adiciona a resposta da IA no histórico
      await addChatMessage({ role: 'model', content: responseText });
    } catch (error) {
      console.error("Erro de conexão ao consultar o Assessor IA:", error);
      await addChatMessage({ 
        role: 'model', 
        content: 'Ops! Ocorreu um erro ao conectar com o servidor do Gemini. Verifique sua conexão ou se a chave VITE_GEMINI_API_KEY está ativa.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-100px)]">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
            <Bot className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Assessor IA
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">Tire dúvidas, receba dicas de economia e planeje suas finanças.</p>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2 flex items-center gap-1.5 text-xs font-medium"
            title="Limpar Histórico"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar Chat</span>
          </button>
        )}
      </header>

      <div className="flex-1 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col relative transition-colors">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-75 py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Bot className="w-9 h-9" />
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">E aí! Sou seu assessor financeiro.</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Pergunte sobre seu saldo atual, como economizar no mercado ou como planejar sua reserva de emergência!
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 md:gap-4 max-w-[88%] sm:max-w-[80%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                    msg.role === 'user' 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/10"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "px-4 md:px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base",
                    msg.role === 'user' 
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white rounded-tr-sm" 
                      : "bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 md:gap-4 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-tl-sm flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assessor digitando</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-100/70 dark:bg-black/30 border-t border-slate-200 dark:border-white/10 transition-colors">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou peça um conselho..."
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pr-14 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all text-sm md:text-base shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-sm"
              title="Enviar Mensagem"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

