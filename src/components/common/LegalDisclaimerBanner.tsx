import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="no-print bg-amber-50 border-l-4 border-amber-500 p-3.5 mb-5 rounded-r-lg shadow-xs flex items-start justify-between gap-3 text-amber-900 text-xs sm:text-sm">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Aviso sobre Validade Jurídica de Evidências:</span> Os registros de ciência e assinaturas na tela no POP Control constituem evidências eletrônicas internas de recebimento e capacitação. Assinaturas simples na tela não equivalem automaticamente a assinaturas digitais qualificadas (GOV.BR / ICP-Brasil). Consulte seu departamento jurídico para validar requisitos legais específicos.
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-950 p-1 rounded-md transition-colors"
        title="Fechar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
