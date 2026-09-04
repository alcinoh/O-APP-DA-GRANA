export interface SourceInfo {
  icon: string;
  label: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export function getSourceInfo(source?: string, type?: 'income' | 'expense'): SourceInfo {
  const s = (source || '').toLowerCase().trim();

  if (s.includes('alimenta') || s === 'va') {
    return {
      icon: '🛒',
      label: source || 'Vale Alimentação',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-700 dark:text-amber-300',
      borderClass: 'border-amber-500/25'
    };
  }

  if (s.includes('refei') || s === 'vr') {
    return {
      icon: '🍽️',
      label: source || 'Vale Refeição',
      badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25',
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-700 dark:text-orange-300',
      borderClass: 'border-orange-500/25'
    };
  }

  if (s.includes('extra') || s.includes('freela') || s.includes('bico')) {
    return {
      icon: '⚡',
      label: source || 'Renda Extra',
      badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
      bgClass: 'bg-purple-500/10',
      textClass: 'text-purple-700 dark:text-purple-300',
      borderClass: 'border-purple-500/25'
    };
  }

  if (s.includes('cart') || s.includes('credito') || s.includes('debito')) {
    return {
      icon: '💳',
      label: source || 'Cartão',
      badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
      bgClass: 'bg-indigo-500/10',
      textClass: 'text-indigo-700 dark:text-indigo-300',
      borderClass: 'border-indigo-500/25'
    };
  }

  if (s.includes('dinheiro') || s.includes('especie') || s.includes('carteira')) {
    return {
      icon: '💵',
      label: source || 'Dinheiro Físico',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      borderClass: 'border-emerald-500/25'
    };
  }

  if (s.includes('reserva') || s.includes('poup') || s.includes('invest')) {
    return {
      icon: '🛡️',
      label: source || 'Reserva / Investimento',
      badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
      bgClass: 'bg-cyan-500/10',
      textClass: 'text-cyan-700 dark:text-cyan-300',
      borderClass: 'border-cyan-500/25'
    };
  }

  if (s.includes('bonific') || s.includes('13') || s.includes('premio')) {
    return {
      icon: '🎁',
      label: source || 'Bonificação / Prêmio',
      badgeClass: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/25',
      bgClass: 'bg-pink-500/10',
      textClass: 'text-pink-700 dark:text-pink-300',
      borderClass: 'border-pink-500/25'
    };
  }

  // Padrão: Salário / Conta
  return {
    icon: '💼',
    label: source || 'Salário',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500/25'
  };
}
