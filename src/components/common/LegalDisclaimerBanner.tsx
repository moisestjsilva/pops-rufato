import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('hide_legal_disclaimer') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('hide_legal_disclaimer', 'true');
    setDismissed(true);
  };

  return (
    <div className="no-print bg-slate-50 border border-slate-200/90 p-3 mb-5 rounded-xl shadow-2xs flex items-center justify-between gap-3 text-slate-600 text-xs">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-semibold">Validade de Evidências:</strong> Os registros e assinaturas em tela constituem comprovações internas de recebimento e capacitação. Para validade qualificada (GOV.BR / ICP-Brasil), consulte as normas jurídicas aplicáveis.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/50 transition-colors shrink-0"
        title="Dispensar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

