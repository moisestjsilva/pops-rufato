import React from 'react';
import { X, History, UserCheck, Shield, FileText, ArrowRight, Clock, FileCheck } from 'lucide-react';
import { POP, POPVersion } from '../../types';
import { formatDate, getPOPStatusBadge } from '../../utils/helpers';
import { useData } from '../../context/DataContext';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pop: POP;
  onSelectVersion?: (version: POPVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  pop,
  onSelectVersion
}) => {
  const { changeLogs } = useData();
  if (!isOpen) return null;

  const versions = pop.versions || [];
  const popChangeLogs = changeLogs.filter(chg => chg.pop_id === pop.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Histórico Detalhado de Alterações e Versionamento</h3>
              <p className="text-xs text-slate-400">{pop.code} - {pop.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Rastreabilidade de Compliance ISO / GMP:</strong> Cada alteração neste procedimento é vinculada com selo de data/hora, identificação do usuário autor/aprovador, seu perfil de acesso e justificativa técnica formal da modificação.
            </div>
          </div>

          {/* Versions and detailed change log timeline */}
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {versions.map((ver, idx) => {
              const badge = getPOPStatusBadge(ver.status);
              const relatedLogs = popChangeLogs.filter(
                l => l.pop_version_id === ver.id || l.version_number === ver.version_number
              );

              return (
                <div key={ver.id || idx} className="relative pl-6">
                  {/* Circle Marker */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                    ver.status === 'publicado' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 bg-slate-200'
                  }`} />

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          Versão {ver.version_number}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(ver.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <strong className="text-slate-900 block mb-0.5">Motivo / Descrição da Versão:</strong>
                      {ver.change_reason || 'Nenhum motivo informado.'}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Autor / Editor:</span>
                        <span className="font-semibold text-slate-900">{ver.author_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Aprovador Responsável:</span>
                        <span className="font-semibold text-slate-900">{ver.approver_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Data da Publicação:</span>
                        <span className="font-semibold text-slate-900">{formatDate(ver.published_date)}</span>
                      </div>
                    </div>

                    {/* Change logs sub-items */}
                    {relatedLogs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Registros de Eventos desta Versão:
                        </span>
                        <div className="space-y-1.5">
                          {relatedLogs.map(log => (
                            <div key={log.id} className="text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="font-bold text-slate-800">{log.action}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 font-semibold bg-slate-200 text-slate-700 rounded-xs">
                                    {log.user_role}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  <span className="font-medium text-slate-700">{log.user_name}</span>: "{log.change_reason}"
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ver.document_hash && (
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-200/70 p-1.5 rounded-md truncate">
                        Hash de Integridade: {ver.document_hash}
                      </div>
                    )}

                    {onSelectVersion && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            onSelectVersion(ver);
                            onClose();
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs transition-colors"
                        >
                          Visualizar esta versão <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
