import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bot, Send, User, Trash2, Loader2, BookmarkPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './Layout';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { format } from 'date-fns';
import { ChatMessage } from '../types';

export function AIChat() {
  const { chatHistory, addChatMessage, clearChat, balance, totalIncome, totalExpense, transactions, addStrategy } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<Record<string, boolean>>({});
  const [savingMessageIds, setSavingMessageIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSaveStrategy = async (msg: ChatMessage, index: number) => {
    const msgId = msg.id || `msg-${index}`;
    if (savedMessageIds[msgId] || savingMessageIds[msgId]) return;

    setSavingMessageIds(prev => ({ ...prev, [msgId]: true }));

    try {
      // 1. Obtém a pergunta que o usuário fez imediatamente antes desta resposta
      let userQuestion = "";
      for (let i = index - 1; i >= 0; i--) {
        if (chatHistory[i].role === 'user') {
          userQuestion = chatHistory[i].content.trim();
          break;
        }
      }

      // 2. Gera o título da estratégia
      let title = "";
      if (userQuestion) {
        title = userQuestion.length > 55 ? `${userQuestion.slice(0, 52)}...` : userQuestion;
      } else {
        title = `Plano Estratégico - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
      }

      // 3. Gera uma descrição concisa
      const cleanContent = msg.content.replace(/[#*`_]/g, '').trim();
      const description = cleanContent.length > 110 
        ? `${cleanContent.slice(0, 107)}...` 
        : (cleanContent || "Estratégia e orientação financeira do Assessor IA.");

      await addStrategy({
        title,
        description,
        content: msg.content,
        type: 'Assessor IA'
      });

      setSavedMessageIds(prev => ({ ...prev, [msgId]: true }));
    } catch (err) {
      console.error("Erro ao salvar estratégia:", err);
    } finally {
      setSavingMessageIds(prev => ({ ...prev, [msgId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    // 1. Limpa o input imediatamente e adiciona ao estado da conversa
    setInput('');
    setIsLoading(true);

    try {
      await addChatMessage({ role: 'user', content: userMsg });

      // 2. Monta o contexto financeiro real do usuário
      const context = `Contexto Financeiro Atual do Usuário:
- Saldo em Conta: R$ ${balance.toFixed(2)}
- Receitas Totais: R$ ${totalIncome.toFixed(2)}
- Despesas Totais: R$ ${totalExpense.toFixed(2)}
- Últimos 5 Lançamentos: ${transactions.length > 0 ? transactions.slice(-5).map(t => `${t.description} (${t.type === 'income' ? '+' : '-'}R$ ${t.amount.toFixed(2)})`).join(', ') : 'Nenhum lançamento cadastrado ainda'}`;

      const prompt = `Você é o Assessor de Finanças Pessoais do aplicativo "Acessoria". Responda de forma prática, acolhedora e direta, como um amigo experiente em educação financeira no WhatsApp. Use linguagem coloquial e natural do Brasil (ex: "E aí!", "Bora organizar", etc).

${context}

Pergunta / Mensagem do Usuário: "${userMsg}"`;

      // 3. Executa a requisição ao Gemini com o SDK oficial @google/generative-ai
      const genAI = new GoogleGenerativeAI(apiKey || "");
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const response = await model.generateContent(prompt);

      const responseText = response.response.text()?.trim() || "Desculpe, não consegui formular uma resposta neste momento.";

      // 5. Adiciona a resposta da IA no histórico
      await addChatMessage({ role: 'model', content: responseText });
    } catch (err) {
      console.error("Erro na chamada do Gemini API:", err);
      const errorMsg = err instanceof Error ? ` (${err.message})` : '';
      await addChatMessage({ 
        role: 'model', 
        content: `Ops! Ocorreu um erro ao conectar com o Assessor Gemini${errorMsg}. Verifique o console do navegador e certifique-se de que a chave VITE_GEMINI_API_KEY é válida.` 
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
        <div className="flex items-center gap-2">
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
        </div>
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
              {chatHistory.map((msg, idx) => {
                const msgId = msg.id || `msg-${idx}`;
                const isSaved = !!savedMessageIds[msgId];
                const isSaving = !!savingMessageIds[msgId];

                return (
                  <motion.div
                    key={msgId}
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
                    <div className="flex flex-col">
                      <div className={cn(
                        "px-4 md:px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base",
                        msg.role === 'user' 
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white rounded-tr-sm" 
                          : "bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                      )}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Botão para Salvar Resposta como Estratégia */}
                      {msg.role === 'model' && (
                        <div className="mt-1.5 flex items-center">
                          <button
                            type="button"
                            onClick={() => handleSaveStrategy(msg, idx)}
                            disabled={isSaved || isSaving}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200",
                              isSaved
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-200/70 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/70 dark:border-white/10 shadow-sm active:scale-95 cursor-pointer"
                            )}
                            title="Salvar esta resposta na aba de Estratégias"
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Salvo! ✓</span>
                              </>
                            ) : isSaving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                <span>Salvando...</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Salvar Estratégia</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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


