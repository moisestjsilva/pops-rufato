import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { POP } from '../types';
import { formatDate, getPOPStatusBadge } from '../utils/helpers';
import { ApprovalModal } from '../components/pops/ApprovalModal';

interface ApprovalsPageProps {
  onNavigate: (path: string) => void;
  onSelectPOP: (pop: POP) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ onNavigate, onSelectPOP }) => {
  const { pops, approvePOPVersion, rejectPOPVersion } = useData();
  const { currentUser, userRole } = useAuth();

  const [selectedPOPForModal, setSelectedPOPForModal] = useState<POP | null>(null);

  const pendingPops = pops.filter(p => p.status === 'em_aprovacao');
  const evaluatedPops = pops.filter(p => p.status === 'publicado' || p.status === 'aprovado' || p.status === 'reprovado');

  const handleApprove = (comments: string) => {
    if (!selectedPOPForModal) return;
    const latestVersion = selectedPOPForModal.versions?.[selectedPOPForModal.versions.length - 1];
    if (latestVersion) {
      approvePOPVersion(selectedPOPForModal.id, latestVersion.id, comments, currentUser, true);
    }
  };

  const handleReject = (reason: string) => {
    if (!selectedPOPForModal) return;
    const latestVersion = selectedPOPForModal.versions?.[selectedPOPForModal.versions.length - 1];
    if (latestVersion) {
      rejectPOPVersion(selectedPOPForModal.id, latestVersion.id, reason, currentUser);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          Central de Aprovação de Procedimentos Operacionais
        </h2>
        <p className="text-xs text-slate-500">
          Workflow formal de validação técnica por Gestores e administradores de Compliance
        </p>
      </div>

      {/* Pending Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          POPs Aguardando Aprovação ({pendingPops.length})
        </h3>

        {pendingPops.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhum procedimento aguardando aprovação no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPops.map(pop => (
              <div key={pop.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900 text-sm">{pop.code} - Versão {pop.current_version}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                    AGUARDANDO APROVAÇÃO
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{pop.title}</h4>
                <div className="text-xs text-slate-600">
                  <div><strong>Setor:</strong> {pop.department_name}</div>
                  <div><strong>Autor:</strong> {pop.author_name}</div>
                  <div><strong>Enviado em:</strong> {formatDate(pop.updated_at)}</div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onSelectPOP(pop)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> Visualizar
                  </button>

                  {(userRole === 'ADMINISTRADOR' || userRole === 'GESTOR') && (
                    <button
                      onClick={() => setSelectedPOPForModal(pop)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Avaliar & Aprovar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      {selectedPOPForModal && (
        <ApprovalModal
          isOpen={Boolean(selectedPOPForModal)}
          onClose={() => setSelectedPOPForModal(null)}
          pop={selectedPOPForModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
