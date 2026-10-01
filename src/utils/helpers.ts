export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCPF(cpf: string): string {
  const formatted = formatCPF(cpf);
  // e.g., 444.555.666-77 -> ***.555.666-**
  return formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, '***.$2.$3-**');
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).toUpperCase().padStart(8, '0');
  return `${hex}${hex2}`;
}

export function getRevisionStatus(nextReviewDateStr: string): {
  status: 'em_dia' | 'proximo' | 'vencido';
  label: string;
  colorClass: string;
  badgeClass: string;
  icon: string;
} {
  if (!nextReviewDateStr) {
    return {
      status: 'em_dia',
      label: 'Em dia',
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: '●'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(nextReviewDateStr);
  reviewDate.setHours(0, 0, 0, 0);

  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'vencido',
      label: 'Vencido',
      colorClass: 'text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: '●'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'proximo',
      label: `Próximo (${diffDays}d)`,
      colorClass: 'text-amber-700',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: '●'
    };
  } else {
    return {
      status: 'em_dia',
      label: 'Em dia',
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: '●'
    };
  }
}

export function getPOPStatusBadge(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'publicado':
      return { label: 'PUBLICADO', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'rascunho':
      return { label: 'RASCUNHO', className: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'em_revisao':
      return { label: 'EM REVISÃO', className: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'em_aprovacao':
      return { label: 'EM APROVAÇÃO', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'aprovado':
      return { label: 'APROVADO', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'reprovado':
      return { label: 'REPROVADO', className: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'obsoleto':
      return { label: 'OBSOLETO', className: 'bg-slate-100 text-slate-500 border-slate-200' };
    default:
      return { label: status.toUpperCase(), className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
}
