import React, { useState } from 'react';
import { History, Search, Download, ShieldCheck, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDateTime } from '../utils/helpers';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    log.user_name.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.entity_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Email', 'Papel', 'Ação', 'Entidade', 'Detalhes', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at,
      l.user_name,
      l.user_email,
      l.user_role,
      l.action,
      l.entity_name,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ip_address
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-600" />
            Log de Auditoria Imutável & Rastreabilidade
          </h2>
          <p className="text-xs text-slate-500">
            Registro cronológico inalterável de todas as ações executadas no sistema (Compliance & ISO 9001 / IATF 16949)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative text-xs w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar no log de auditoria..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Papel (RBAC)</th>
                <th className="py-3 px-4">Ação Executada</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">Detalhes da Operação</th>
                <th className="py-3 px-4">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.user_name}</div>
                      <div className="text-[10px] text-slate-400">{log.user_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-900">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.entity_name}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
