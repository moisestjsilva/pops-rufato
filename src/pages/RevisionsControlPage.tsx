import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2, RefreshCw, Eye, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { POP } from '../types';
import { formatDate, getRevisionStatus } from '../utils/helpers';

interface RevisionsControlPageProps {
  onNavigate: (path: string) => void;
  onSelectPOP: (pop: POP) => void;
  onEditPOP: (pop: POP) => void;
}

export const RevisionsControlPage: React.FC<RevisionsControlPageProps> = ({
  onNavigate,
  onSelectPOP,
  onEditPOP
}) => {
  const { pops } = useData();
  const { userRole } = useAuth();
  const [filter, setFilter] = useState<'todos' | 'vencidos' | 'proximos' | 'em_dia'>('todos');

  const popsWithRevision = pops.map(pop => ({
    pop,
    rev: getRevisionStatus(pop.next_review_date)
  }));

  const filtered = popsWithRevision.filter(item => {
    if (filter === 'vencidos') return item.rev.status === 'vencido';
    if (filter === 'proximos') return item.rev.status === 'proximo';
    if (filter === 'em_dia') return item.rev.status === 'em_dia';
    return true;
  });

  const vencidosCount = popsWithRevision.filter(i => i.rev.status === 'vencido').length;
  const proximosCount = popsWithRevision.filter(i => i.rev.status === 'proximo').length;
  const emDiaCount = popsWithRevision.filter(i => i.rev.status === 'em_dia').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Controle de Revisões Periódicas
        </h2>
        <p className="text-xs text-slate-500">
          Monitoramento automático de prazos de validade e periodicidade de revisão dos procedimentos
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
        <button
          onClick={() => setFilter('todos')}
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            filter === 'todos' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Todos ({pops.length})</span>
        </button>

        <button
          onClick={() => setFilter('vencidos')}
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            filter === 'vencidos' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Vencidos ({vencidosCount})
          </span>
        </button>

        <button
          onClick={() => setFilter('proximos')}
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            filter === 'proximos' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Vencem em 30d ({proximosCount})
          </span>
        </button>

        <button
          onClick={() => setFilter('em_dia')}
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            filter === 'em_dia' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Em Dia ({emDiaCount})
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">POP / Título</th>
              <th className="py-3 px-4">Setor</th>
              <th className="py-3 px-4">Versão</th>
              <th className="py-3 px-4">Periodicidade</th>
              <th className="py-3 px-4">Última Revisão</th>
              <th className="py-3 px-4">Próxima Revisão</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map(({ pop, rev }) => (
              <tr key={pop.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="font-extrabold text-blue-900 block">{pop.code}</span>
                  <span className="text-slate-700 line-clamp-1">{pop.title}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{pop.department_name}</td>
                <td className="py-3 px-4 font-bold text-slate-800">V{pop.current_version}</td>
                <td className="py-3 px-4 text-slate-600">{pop.review_period_months} Meses</td>
                <td className="py-3 px-4 text-slate-600">{formatDate(pop.last_review_date || pop.updated_at)}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{formatDate(pop.next_review_date)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${rev.badgeClass}`}>
                    {rev.icon} {rev.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEditPOP(pop)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 flex items-center gap-1 ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Revisar POP
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
