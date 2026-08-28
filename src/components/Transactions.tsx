import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  Pencil, 
  X, 
  Check, 
  Camera, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseISO, format, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './Layout';
import { Transaction } from '../types';
import { parseReceiptWithGemini } from '../lib/gemini';
import { BankStatementModal } from './BankStatementModal';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const TransactionRow: React.FC<{ t: Transaction }> = ({ t }) => {
  const { confirmTransaction, deleteTransaction, updateTransaction } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editDesc, setEditDesc] = useState(t.description);
  const [editAmount, setEditAmount] = useState(t.amount.toString());
  const [editCategory, setEditCategory] = useState(t.category);
  const [editDate, setEditDate] = useState(t.date);
  const [editStatus, setEditStatus] = useState(t.status);
  const [editType, setEditType] = useState(t.type);

  const isFut = isFuture(parseISO(t.date));
  const canConfirm = t.status === 'Pendente' && !isFut;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTransaction(t.id, {
      description: editDesc,
      amount: parseFloat(editAmount),
      category: editCategory,
      date: editDate,
      status: editStatus,
      type: editType
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 md:px-6 bg-slate-50 dark:bg-white/5 transition-colors border-b border-slate-200/70 dark:border-white/5">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setEditType('expense')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                editType === 'expense' ? "bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-white/5" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" /> Despesa
            </button>
            <button
              type="button"
              onClick={() => setEditType('income')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                editType === 'income' ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-white/5" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" /> Receita
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="lg:col-span-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 bg-white dark:bg-black/20 text-slate-900 dark:text-white"
              required
              placeholder="Descrição"
            />
            <input
              type="number"
              step="0.01"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 bg-white dark:bg-black/20 text-slate-900 dark:text-white"
              required
              placeholder="Valor"
            />
            <input
              type="text"
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 bg-white dark:bg-black/20 text-slate-900 dark:text-white"
              required
              placeholder="Categoria"
            />
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 bg-white dark:bg-black/20 text-slate-900 dark:text-white"
              required
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Status:</span>
              <button
                type="button"
                onClick={() => setEditStatus('Pendente')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-bold transition-colors border",
                  editStatus === 'Pendente' ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                Pendente
              </button>
              <button
                type="button"
                onClick={() => setEditStatus('Confirmado')}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-bold transition-colors border",
                  editStatus === 'Confirmado' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                Confirmado
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditDesc(t.description);
                  setEditAmount(t.amount.toString());
                  setEditCategory(t.category);
                  setEditDate(t.date);
                  setEditStatus(t.status);
                  setEditType(t.type);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-xs"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs"
              >
                <Check className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
          t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
        )}>
          {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="whitespace-nowrap">{format(parseISO(t.date), "dd/MM/yyyy")}</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
            <span className="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{t.category}</span>
            {t.status === 'Pendente' && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded uppercase tracking-wider font-bold whitespace-nowrap">Pendente</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:ml-4 border-t border-slate-100 dark:border-white/5 sm:border-0 pt-3 sm:pt-0">
        <span className={cn(
          "font-bold text-lg whitespace-nowrap",
          t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {canConfirm && (
            <button
              onClick={() => confirmTransaction(t.id)}
              className="p-1.5 md:p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Confirmar pagamento/recebimento"
            >
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => deleteTransaction(t.id)}
            className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export function Transactions() {
  const { transactions, addTransaction } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningReceipt(true);
    setScanSuccessMessage(null);
    setScanErrorMessage(null);

    try {
      const fileMimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      // Converte arquivo para Base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          if (!reader.result) {
            throw new Error("Arquivo vazio ou ilegível.");
          }

          const base64Data = reader.result.toString().includes(',') ? reader.result.toString().split(',')[1] : reader.result.toString();

          const extracted = await parseReceiptWithGemini(base64Data, fileMimeType);

          // Preenche os campos do formulário
          setDescription(extracted.description);
          setAmount(extracted.amount > 0 ? extracted.amount.toString() : '');
          setCategory(extracted.category);
          setDate(extracted.date);
          setType(extracted.type);

          // Abre o formulário para o usuário revisar
          setIsFormOpen(true);
          setScanSuccessMessage(`✨ Dados lidos com sucesso da nota fiscal! Confira os campos abaixo e clique em Salvar.`);
        } catch (erro: any) {
          console.error("Erro Gemini:", erro);
          setScanErrorMessage("Falha na IA: " + (erro.message || JSON.stringify(erro)));
        } finally {
          setIsScanningReceipt(false);
        }
      };

      reader.onerror = (err) => {
        console.error("Erro ao ler o arquivo no dispositivo:", err);
        setIsScanningReceipt(false);
        setScanErrorMessage("Erro ao ler o arquivo no dispositivo.");
      };

      reader.readAsDataURL(file);
    } catch (erro: any) {
      console.error("Erro Gemini:", erro);
      setIsScanningReceipt(false);
      setScanErrorMessage("Falha na IA: " + (erro.message || JSON.stringify(erro)));
    }
  };

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
    setScanSuccessMessage(null);
    setScanErrorMessage(null);
    setIsFormOpen(false);
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Hidden File Input with Camera Capture on Mobile */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Lançamentos</h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">Gerencie suas receitas, despesas e comprovantes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Extrato */}
          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl transition-all font-bold text-xs border border-slate-200 dark:border-white/10"
          >
            <FileText className="w-4 h-4" />
            <span>Extrato</span>
          </button>

          {/* Botão Ler Comprovante com IA */}
          <button
            onClick={handleTriggerFileInput}
            disabled={isScanningReceipt}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-all font-bold text-xs shadow-md shadow-indigo-600/20"
            title="Tirar foto ou enviar foto de nota fiscal / comprovante"
          >
            {isScanningReceipt ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Lendo documento...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ler Comprovante com IA</span>
              </>
            )}
          </button>

          {/* Botão Nova Transação Manual */}
          <button
            onClick={() => {
              setScanSuccessMessage(null);
              setScanErrorMessage(null);
              setIsFormOpen(!isFormOpen);
            }}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-xl transition-all font-bold text-xs shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </header>

      {/* Scanning Loader Banner */}
      {isScanningReceipt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-sm shadow-sm"
        >
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <p className="font-bold">A IA está lendo seu documento...</p>
            <p className="text-xs opacity-90">Identificando estabelecimento, data, categoria e valor total automaticamente.</p>
          </div>
        </motion.div>
      )}

      {/* Scan Success Banner */}
      {scanSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 text-sm shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{scanSuccessMessage}</p>
          </div>
          <button onClick={() => setScanSuccessMessage(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Scan Error Banner */}
      {scanErrorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-800 dark:text-rose-300 text-sm shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{scanErrorMessage}</p>
          </div>
          <button onClick={() => setScanErrorMessage(null)} className="p-1 hover:bg-rose-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>Preencher Lançamento</span>
                  {scanSuccessMessage && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                      Preenchido por IA
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200/60 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      type === 'expense' ? "bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-white/5" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      type === 'income' ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-white/5" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Receita
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descrição</label>
                    <input
                      type="text"
                      placeholder="Descrição (ex: Mercado, Salário)"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor (R$)"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoria</label>
                    <input
                      type="text"
                      placeholder="Categoria (ex: Alimentação)"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Data</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white dark:bg-black/20 text-slate-900 dark:text-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm text-sm"
                  >
                    Salvar Lançamento
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
        {sortedTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Nenhum lançamento encontrado. Crie um novo ou fotografe um comprovante com a IA acima!
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-white/5">
            {sortedTransactions.map(t => (
              <TransactionRow key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Extrato Bancário Modal */}
      <BankStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </div>
  );
}
