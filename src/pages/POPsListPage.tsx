import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  History, 
  Download, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Users,
  Grid,
  List
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { POP } from '../types';
import { formatDate, getPOPStatusBadge, getRevisionStatus } from '../utils/helpers';

interface POPsListPageProps {
  onNavigate: (path: string) => void;
  onSelectPOP: (pop: POP) => void;
  onCreatePOP: () => void;
}

export const POPsListPage: React.FC<POPsListPageProps> = ({
  onNavigate,
  onSelectPOP,
  onCreatePOP
}) => {
  const { pops, departments, companies } = useData();
  const { currentUser, userRole, canCreatePOP, canEditPOP, isStandardUser, isSectorAdmin, isSuperAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  // Se for USUÁRIO padrão, restringe por padrão ao seu próprio setor
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    if (isStandardUser() && currentUser?.department_id) {
      return currentUser.department_id;
    }
    return 'TODOS';
  });
  const [selectedRevision, setSelectedRevision] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredPOPs = pops.filter(pop => {
    // Regra 3 (RBAC): USUÁRIO possui acesso restrito ao seu próprio setor
    if (isStandardUser() && currentUser?.department_id && pop.department_id !== currentUser.department_id) {
      return false;
    }

    // Search match
    const matchQuery = 
      pop.code.toLowerCase().includes(search.toLowerCase()) ||
      pop.title.toLowerCase().includes(search.toLowerCase()) ||
      pop.author_name.toLowerCase().includes(search.toLowerCase()) ||
      pop.department_name.toLowerCase().includes(search.toLowerCase());

    if (!matchQuery) return false;

    // Status filter
    if (selectedStatus !== 'TODOS' && pop.status !== selectedStatus) return false;

    // Dept filter
    if (selectedDept !== 'TODOS' && pop.department_id !== selectedDept) return false;

    // Revision status filter
    if (selectedRevision !== 'TODOS') {
      const rev = getRevisionStatus(pop.next_review_date);
      if (selectedRevision === 'vencido' && rev.status !== 'vencido') return false;
      if (selectedRevision === 'proximo' && rev.status !== 'proximo') return false;
      if (selectedRevision === 'em_dia' && rev.status !== 'em_dia') return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">
            Procedimentos Operacionais Padrão (POPs)
          </h2>
          <p className="text-xs text-slate-500">
            {isStandardUser()
              ? `Visualização restrita ao seu setor (${currentUser?.department_name || 'Produção'})`
              : isSectorAdmin()
              ? 'Gestão de POPs dos setores delegados sob sua responsabilidade'
              : 'Controle Global de versão, vigência e conformidade de todos os setores'}
          </p>
        </div>

        {/* Botão Criar Novo POP: Apenas se tiver permissão (Super Admin, Admin do setor ou Usuário com permissão explícita) */}
        {canCreatePOP(selectedDept !== 'TODOS' ? selectedDept : undefined) && (
          <button
            onClick={onCreatePOP}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Criar Novo POP
          </button>
        )}
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código, título, autor ou setor..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="publicado">Publicados</option>
              <option value="rascunho">Rascunhos</option>
              <option value="em_aprovacao">Em Aprovação</option>
              <option value="reprovado">Reprovados</option>
              <option value="obsoleto">Obsoletos</option>
            </select>
          </div>

          {/* Dept Select */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="TODOS">Todos os Setores</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Revision Select */}
          <div>
            <select
              value={selectedRevision}
              onChange={e => setSelectedRevision(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="TODOS">Status de Revisão</option>
              <option value="em_dia">🟢 Em dia</option>
              <option value="proximo">🟡 Próximo de vencer</option>
              <option value="vencido">🔴 Vencido</option>
            </select>
          </div>
        </div>

        {/* View Mode & Counter Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Exibindo <strong>{filteredPOPs.length}</strong> de <strong>{pops.length}</strong> procedimento(s)</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
              title="Visão em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
              title="Visão em Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* POPs Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Código / Título</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Versão</th>
                  <th className="py-3 px-4">Status POP</th>
                  <th className="py-3 px-4">Status Revisão</th>
                  <th className="py-3 px-4">Próx. Revisão</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPOPs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum procedimento operacional encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredPOPs.map(pop => {
                    const badge = getPOPStatusBadge(pop.status);
                    const rev = getRevisionStatus(pop.next_review_date);
                    return (
                      <tr 
                        key={pop.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => onSelectPOP(pop)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-blue-900">{pop.code}</div>
                          <div className="text-slate-700 line-clamp-1 max-w-xs">{pop.title}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {pop.department_name}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          V{pop.current_version}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${rev.badgeClass}`}>
                            {rev.icon} {rev.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(pop.next_review_date)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectPOP(pop)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Visualizar POP"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPOPs.map(pop => {
            const badge = getPOPStatusBadge(pop.status);
            const rev = getRevisionStatus(pop.next_review_date);
            return (
              <div
                key={pop.id}
                onClick={() => onSelectPOP(pop)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-blue-900 text-sm">{pop.code}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {pop.title}
                  </h3>
                  <p className="text-xs text-slate-500">Setor: {pop.department_name} | Classificação: {pop.classification}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Vigência Versão {pop.current_version}:</span>
                    <span className={`font-bold ${rev.colorClass}`}>{rev.icon} {rev.label}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPOP(pop);
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100"
                  >
                    Ver Detalhes &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
