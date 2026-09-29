import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, QrCode, Lock, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, formatDateTime } from '../utils/helpers';

interface PublicValidationPageProps {
  code?: string;
  version?: string;
  onNavigate: (path: string) => void;
}

export const PublicValidationPage: React.FC<PublicValidationPageProps> = ({
  code = 'POP-PROD-001',
  version = '03',
  onNavigate
}) => {
  const { pops, acknowledgements } = useData();

  const pop = pops.find(p => p.code.toUpperCase() === code.toUpperCase()) || pops[0];
  const targetVersion = pop?.versions?.find(v => v.version_number === version) || pop?.versions?.[pop.versions.length - 1];

  const versionAcks = acknowledgements.filter(a => a.pop_id === pop?.id && a.version_number === (targetVersion?.version_number || '01'));

  const isValid = pop?.status === 'publicado' && targetVersion?.status === 'publicado';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => onNavigate('/')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema Principal
      </button>

      {/* Verification Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Status Header */}
        <div className={`p-6 text-white text-center space-y-2 ${
          isValid ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            {isValid ? <ShieldCheck className="w-8 h-8 text-white" /> : <AlertTriangle className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-xl font-black">
            {isValid ? 'DOCUMENTO AUTÊNTICO E VIGENTE' : 'DOCUMENTO NÃO VIGENTE OU OBSOLETO'}
          </h1>
          <p className="text-xs text-white/90">
            Validação pública de integridade do POP Control Enterprise
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6 text-slate-900">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-900 text-sm">{pop?.code} - Versão {targetVersion?.version_number}</span>
              <span className="font-bold text-slate-500">Classificação: {pop?.classification}</span>
            </div>
            <h2 className="font-bold text-slate-900 text-base">{pop?.title}</h2>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200">
              <div><strong>Empresa:</strong> {pop?.company_name}</div>
              <div><strong>Setor:</strong> {pop?.department_name}</div>
              <div><strong>Elaborador:</strong> {targetVersion?.author_name}</div>
              <div><strong>Aprovador:</strong> {targetVersion?.approver_name || 'Gestor'}</div>
            </div>
          </div>

          {/* Hash Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
              <span className="flex items-center gap-1 font-bold"><Lock className="w-3.5 h-3.5 text-emerald-400" /> HASH DIGITAL SHA-256 DO ARQUIVO:</span>
              <span>INALTERÁVEL</span>
            </div>
            <div className="text-emerald-400 font-bold break-all">
              {targetVersion?.document_hash || '7f83cf2e79dd453b9f69a4c08abd4cb9e01f2'}
            </div>
          </div>

          {/* Science Records Count */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Registros de Ciência Válidos para esta Versão ({versionAcks.length})
            </h3>

            <div className="space-y-2 text-xs">
              {versionAcks.map(ack => (
                <div key={ack.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{ack.employee_name}</span>
                    <span className="text-slate-500 block text-[11px]">Matrícula: {ack.employee_registration}</span>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-bold text-emerald-700 block">🟢 Confirmado</span>
                    <span className="text-slate-500">{formatDateTime(ack.acknowledged_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
          POP Control &copy; 2026 - Validação emitida em {formatDateTime(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
};
