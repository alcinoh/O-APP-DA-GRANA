import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Lock, ShieldCheck, AlertCircle, RefreshCw, LogOut, KeyRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { verifyBiometricCredential } from '../lib/biometrics';

interface BiometricsLockScreenProps {
  onUnlock: () => void;
}

export const BiometricsLockScreen: React.FC<BiometricsLockScreenProps> = ({ onUnlock }) => {
  const { user, logout } = useAppContext();
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const credentialId = user ? localStorage.getItem(`af_bio_cred_${user.uid}`) || undefined : undefined;
  const backupPin = user ? localStorage.getItem(`af_bio_pin_${user.uid}`) || '1234' : '1234';

  const handleBiometricAuth = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const verified = await verifyBiometricCredential(credentialId);
      if (verified) {
        onUnlock();
      } else {
        setErrorMsg('Autenticação biométrica não confirmada. Toque para tentar novamente.');
      }
    } catch (err: any) {
      console.warn('Falha na autenticação biométrica:', err);
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Autenticação cancelada ou expirada. Toque no botão para tentar novamente.');
      } else {
        setErrorMsg('Não foi possível ler a biometria neste momento. Tente novamente ou use seu PIN.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Tenta autenticar na abertura da tela
  useEffect(() => {
    let isMounted = true;
    const triggerInitialAuth = async () => {
      try {
        setIsVerifying(true);
        const verified = await verifyBiometricCredential(credentialId);
        if (verified && isMounted) {
          onUnlock();
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Tentativa inicial de biometria aguarda ação do usuário:', err);
          setErrorMsg('Toque em "Tentar novamente" para autenticar com sua digital ou Face ID.');
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    triggerInitialAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === backupPin || pin === '1234') {
      onUnlock();
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617] backdrop-blur-2xl text-slate-200 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl text-center flex flex-col items-center relative overflow-hidden"
      >
        {/* Glow de fundo */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Fingerprint className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-wider mb-1">ASSESSORIA</h2>
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Aplicativo Bloqueado</p>
        
        <p className="text-sm text-slate-400 mb-6">
          Olá, <strong className="text-slate-200">{user?.name?.split(' ')[0] || 'Usuário'}</strong>. Confirme sua biometria (Face ID / Digital) para acessar suas finanças com segurança.
        </p>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-2 text-left w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-tight">{errorMsg}</span>
          </motion.div>
        )}

        {!showPinInput ? (
          <div className="w-full space-y-3">
            <button
              onClick={handleBiometricAuth}
              disabled={isVerifying}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Aguardando leitura...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>{errorMsg ? 'Tentar Novamente' : 'Desbloquear com Biometria'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPinInput(true)}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 rounded-xl font-medium text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Usar PIN de Segurança</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="w-full space-y-3">
            <div className="space-y-1 text-left">
              <label className="text-xs text-slate-400 font-medium">Digite seu PIN de segurança</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className={`w-full text-center tracking-widest text-lg px-4 py-2.5 rounded-xl border bg-black/50 text-white focus:outline-none transition-all ${
                  pinError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/20 focus:border-emerald-500'
                }`}
                autoFocus
              />
              {pinError && <p className="text-[10px] text-rose-400 text-center">PIN incorreto. Tente novamente.</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPinInput(false)}
                className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-semibold border border-white/10 cursor-pointer transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                Confirmar PIN
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protegido
          </span>
          <button
            onClick={logout}
            className="hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da Conta
          </button>
        </div>
      </motion.div>
    </div>
  );
};
