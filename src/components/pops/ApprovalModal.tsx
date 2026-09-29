import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { POP } from '../../types';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pop: POP;
  onApprove: (comments: string) => void;
  onReject: (reason: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  pop,
  onApprove,
  onReject
}) => {
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'approve') {
      onApprove(text || 'Procedimento aprovado com sucesso.');
    } else {
      if (!text.trim()) return;
      onReject(text);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            Aprovação / Validação de POP
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
            <span className="font-bold block">{pop.code} - Versão {pop.current_version}</span>
            <span className="text-slate-600 line-clamp-1">{pop.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActionType('approve')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                actionType === 'approve'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Aprovar POP
            </button>
            <button
              type="button"
              onClick={() => setActionType('reject')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                actionType === 'reject'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-1 ring-rose-500'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              Reprovar POP
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {actionType === 'approve' ? 'Parecer / Comentários de Aprovação (Opcional):' : 'Motivo Detalhado da Reprovação (Obrigatório):'}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              required={actionType === 'reject'}
              rows={4}
              placeholder={actionType === 'approve' ? 'Ex: Aprovado conforme normas NR-12...' : 'Ex: Faltam detalhes sobre o bloqueio elétrico...'}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {actionType === 'approve'
                ? 'Ao aprovar, a nova versão será publicada automaticamente e todos os colaboradores dos cargos vinculados receberão uma notificação de ciência obrigatória.'
                : 'Ao reprovar, o POP voltará para o status de Reprovado e o autor será notificado com a sua justificativa.'}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionType === 'approve' ? 'Confirmar Aprovação & Publicar' : 'Confirmar Reprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
