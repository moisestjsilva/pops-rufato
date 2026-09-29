import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  Users, 
  Building2, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Search,
  CheckSquare
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getRevisionStatus, getPOPStatusBadge, formatDate } from '../utils/helpers';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { pops, acknowledgements, employees, departments, companies, approvals } = useData();
  const { currentUser, userRole } = useAuth();

  const [selectedCompany, setSelectedCompany] = useState<string>('TODAS');
  const [selectedDept, setSelectedDept] = useState<string>('TODOS');

  // Filtered POPs
  const filteredPOPs = pops.filter(p => {
    if (selectedCompany !== 'TODAS' && p.company_id !== selectedCompany) return false;
    if (selectedDept !== 'TODOS' && p.department_id !== selectedDept) return false;
    return true;
  });

  const totalPOPs = filteredPOPs.length;
  const publicadosCount = filteredPOPs.filter(p => p.status === 'publicado').length;
  const rascunhosCount = filteredPOPs.filter(p => p.status === 'rascunho').length;
  const aprovacaoCount = filteredPOPs.filter(p => p.status === 'em_aprovacao').length;

  // Revision Stats
  let vencidosCount = 0;
  let proximosCount = 0;
  let emDiaCount = 0;

  filteredPOPs.forEach(p => {
    const rev = getRevisionStatus(p.next_review_date);
    if (rev.status === 'vencido') vencidosCount++;
    else if (rev.status === 'proximo') proximosCount++;
    else emDiaCount++;
  });

  // Compliance Calculation:
  // For each employee and published POP assigned to them, check if acknowledged.
  const publishedPOPs = filteredPOPs.filter(p => p.status === 'publicado');
  let totalRequiredAcks = 0;
  let totalCompletedAcks = 0;

  employees.forEach(emp => {
    publishedPOPs.forEach(pop => {
      const isRequired = 
        pop.assigned_department_ids?.includes(emp.department_id) ||
        pop.assigned_position_ids?.includes(emp.position_id);

      if (isRequired) {
        totalRequiredAcks++;
        const hasAck = acknowledgements.some(a => 
          a.employee_id === emp.id && 
          a.pop_id === pop.id && 
          a.version_number === pop.current_version
        );
        if (hasAck) totalCompletedAcks++;
      }
    });
  });

  const overallComplianceRate = totalRequiredAcks > 0 
    ? Math.round((totalCompletedAcks / totalRequiredAcks) * 100) 
    : 100;

  // Chart 1: Compliance Rate per Department
  const deptComplianceData = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department_id === dept.id);
    const deptPops = publishedPOPs.filter(p => p.department_id === dept.id || p.assigned_department_ids?.includes(dept.id));

    let req = 0;
    let done = 0;

    deptEmployees.forEach(emp => {
      deptPops.forEach(pop => {
        req++;
        const hasAck = acknowledgements.some(a => a.employee_id === emp.id && a.pop_id === pop.id);
        if (hasAck) done++;
      });
    });

    const rate = req > 0 ? Math.round((done / req) * 100) : 100;
    return {
      name: dept.name,
      taxa: rate,
      totalPops: deptPops.length
    };
  });

  // Chart 2: Status Distribution (Pie)
  const statusPieData = [
    { name: 'Publicados', value: publicadosCount, color: '#10B981' },
    { name: 'Em Aprovação', value: aprovacaoCount, color: '#F59E0B' },
    { name: 'Rascunho/Revisão', value: rascunhosCount, color: '#64748B' },
  ].filter(d => d.value > 0);

  // My Pending POPs (For Employee/User)
  const myPendingPops = publishedPOPs.filter(pop => {
    const isRequired = 
      pop.assigned_department_ids?.includes(currentUser.department_id) ||
      pop.assigned_position_ids?.includes(currentUser.position_id);

    if (!isRequired) return false;

    const hasAck = acknowledgements.some(a => 
      a.employee_id === currentUser.id && 
      a.pop_id === pop.id && 
      a.version_number === pop.current_version
    );
    return !hasAck;
  });

  // Pending Approvals (For Manager/Admin)
  const pendingApprovalsPops = pops.filter(p => p.status === 'em_aprovacao');

  return (
    <div className="space-y-6 pb-12">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg">
            Dashboard de Compliance Operacional
          </h2>
          <p className="text-xs text-slate-500">
            Visão consolidada de procedimentos, taxas de ciência e trilhas de auditoria
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Empresa:</span>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
            >
              <option value="TODAS">Todas as Empresas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.trade_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Setor:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
            >
              <option value="TODOS">Todos os Setores</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de POPs</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalPOPs}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {publicadosCount} Publicados
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{rascunhosCount} Rascunhos | {aprovacaoCount} Em Aprovação</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice de Compliance</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{overallComplianceRate}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Meta 95%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${overallComplianceRate}%` }} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status de Revisão</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{vencidosCount + proximosCount}</span>
            {vencidosCount > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                {vencidosCount} Vencidos
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">{proximosCount} vencem em 30 dias | {emDiaCount} em dia</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evidências de Ciência</span>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{acknowledgements.length}</span>
            <span className="text-xs font-medium text-slate-500">Registros Auditáveis</span>
          </div>
          <p className="text-[11px] text-slate-500">{employees.length} Colaboradores Ativos</p>
        </div>
      </div>

      {/* Action Banners & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Science for Active User */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Minhas Ciências Pendentes ({myPendingPops.length})
            </h3>
            <span className="text-[11px] text-slate-500">Perfil: {currentUser.full_name}</span>
          </div>

          {myPendingPops.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-emerald-50/50 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="font-bold text-emerald-900">Parabéns! Você está 100% em dia com suas ciências de POPs.</p>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {myPendingPops.map(pop => (
                <div
                  key={pop.id}
                  onClick={() => onNavigate(`/pops/${pop.id}`)}
                  className="p-3 bg-amber-50/60 hover:bg-amber-100/80 rounded-xl border border-amber-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-amber-950">{pop.code} - Versão {pop.current_version}</span>
                    <p className="text-slate-700 font-medium line-clamp-1">{pop.title}</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-200 rounded-md shrink-0">
                    Tomar Ciência &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals for Managers / Admin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              Aprovações Pendentes ({pendingApprovalsPops.length})
            </h3>
            <button
              onClick={() => onNavigate('/aprovacoes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Ver Todas &rarr;
            </button>
          </div>

          {pendingApprovalsPops.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-100">
              Nenhuma solicitação de aprovação pendente no momento.
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {pendingApprovalsPops.map(pop => (
                <div
                  key={pop.id}
                  onClick={() => onNavigate(`/pops/${pop.id}`)}
                  className="p-3 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-blue-950">{pop.code} - Versão {pop.current_version}</span>
                    <p className="text-slate-700 font-medium line-clamp-1">{pop.title}</p>
                    <span className="text-[10px] text-slate-500">Autor: {pop.author_name}</span>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-300 rounded-md shrink-0">
                    Avaliar &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Compliance por Setor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Taxa de Compliance de Ciência por Setor (%)</h3>
              <p className="text-xs text-slate-500">Percentual de colaboradores treinados e cientificados</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptComplianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Taxa de Compliance']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="taxa" radius={[6, 6, 0, 0]}>
                  {deptComplianceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.taxa >= 90 ? '#10B981' : entry.taxa >= 70 ? '#F59E0B' : '#EF4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribuicao de POPs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Distribuição por Status</h3>
            <p className="text-xs text-slate-500">Status dos procedimentos operacionais</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
