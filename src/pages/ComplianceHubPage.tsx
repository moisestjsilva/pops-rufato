import React, { useState } from 'react';
import { 
  BarChart3, 
  Grid, 
  UserCheck2, 
  PieChart, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Search,
  Download,
  Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDateTime, maskCPF } from '../utils/helpers';
import { generateEvidenceReportPDF } from '../lib/pdfGenerator';

interface ComplianceHubPageProps {
  initialSubTab?: 'dashboard' | 'matriz' | 'funcionario' | 'setor' | 'evidencias';
}

export const ComplianceHubPage: React.FC<ComplianceHubPageProps> = ({ initialSubTab = 'matriz' }) => {
  const { employees, pops, acknowledgements, departments } = useData();
  const [subTab, setSubTab] = useState<'matriz' | 'funcionario' | 'setor' | 'evidencias'>(
    initialSubTab === 'dashboard' ? 'matriz' : (initialSubTab as any)
  );

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');
  const [matrixSearch, setMatrixSearch] = useState('');

  const publishedPOPs = pops.filter(p => p.status === 'publicado');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            Central de Compliance Operacional
          </h2>
          <p className="text-xs text-slate-500">
            Matriz de versatilidade, auditoria de ciências e relatórios de conformidade técnica
          </p>
        </div>

        {/* SubTab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setSubTab('matriz')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              subTab === 'matriz' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Matriz Geral
          </button>
          <button
            onClick={() => setSubTab('funcionario')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              subTab === 'funcionario' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <UserCheck2 className="w-3.5 h-3.5" /> Por Funcionário
          </button>
          <button
            onClick={() => setSubTab('setor')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              subTab === 'setor' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Por Setor
          </button>
          <button
            onClick={() => setSubTab('evidencias')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              subTab === 'evidencias' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Evidências Auditáveis
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MATRIZ FUNCIONÁRIO x POP */}
      {subTab === 'matriz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">🟢 Ciente (Versão Vigente)</span>
              <span className="flex items-center gap-1 text-rose-700">🔴 Pendente de Ciência</span>
              <span className="flex items-center gap-1 text-slate-400">⚪ Não Aplicável</span>
            </div>

            <div className="relative w-64 text-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={matrixSearch}
                onChange={e => setMatrixSearch(e.target.value)}
                placeholder="Filtrar colaborador na matriz..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold min-w-[200px]">Colaborador</th>
                    <th className="py-3 px-4 font-bold min-w-[120px]">Setor</th>
                    {publishedPOPs.map(pop => (
                      <th key={pop.id} className="py-3 px-3 font-bold text-center min-w-[110px]" title={pop.title}>
                        <div className="text-blue-300">{pop.code}</div>
                        <div className="text-[10px] text-slate-400">V{pop.current_version}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(e => e.full_name.toLowerCase().includes(matrixSearch.toLowerCase()))
                    .map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {emp.full_name}
                          <div className="text-[10px] text-slate-500 font-normal">{emp.position_title}</div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{emp.department_name}</td>
                        {publishedPOPs.map(pop => {
                          const isRequired = 
                            pop.assigned_department_ids?.includes(emp.department_id) ||
                            pop.assigned_position_ids?.includes(emp.position_id);

                          if (!isRequired) {
                            return (
                              <td key={pop.id} className="py-2.5 px-3 text-center text-slate-300 font-bold">
                                ⚪
                              </td>
                            );
                          }

                          const hasAck = acknowledgements.some(a => 
                            a.employee_id === emp.id && 
                            a.pop_id === pop.id && 
                            a.version_number === pop.current_version
                          );

                          return (
                            <td key={pop.id} className="py-2.5 px-3 text-center">
                              {hasAck ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                                  🟢 CIENTE
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                                  🔴 PENDENTE
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: POR FUNCIONÁRIO */}
      {subTab === 'funcionario' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Selecione o Funcionário:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.registration_number}) - {e.department_name}</option>
              ))}
            </select>
          </div>

          {(() => {
            const emp = employees.find(e => e.id === selectedEmpId);
            if (!emp) return null;

            const myPOPs = publishedPOPs.filter(p => 
              p.assigned_department_ids?.includes(emp.department_id) ||
              p.assigned_position_ids?.includes(emp.position_id)
            );

            return (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{emp.full_name}</h3>
                    <p className="text-xs text-slate-500">
                      CPF: {emp.cpf} | Cargo: {emp.position_title} | Setor: {emp.department_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {myPOPs.length === 0 ? (
                    <p className="text-slate-500 italic">Nenhum POP obrigatório atribuído a este funcionário.</p>
                  ) : (
                    myPOPs.map(pop => {
                      const ack = acknowledgements.find(a => a.employee_id === emp.id && a.pop_id === pop.id && a.version_number === pop.current_version);
                      return (
                        <div key={pop.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-blue-900">{pop.code} - Versão {pop.current_version}</span>
                            <p className="text-slate-700 font-medium">{pop.title}</p>
                          </div>

                          {ack ? (
                            <div className="text-right">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                                CIENTE EM {formatDateTime(ack.acknowledged_at)}
                              </span>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Hash: {ack.document_hash}</div>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-md text-[10px]">
                              PENDENTE DE CIÊNCIA
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUBTAB 3: POR SETOR */}
      {subTab === 'setor' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Selecione o Setor:</span>
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {(() => {
            const dept = departments.find(d => d.id === selectedDeptId);
            const deptEmps = employees.filter(e => e.department_id === selectedDeptId);
            const deptPOPs = publishedPOPs.filter(p => p.department_id === selectedDeptId || p.assigned_department_ids?.includes(selectedDeptId));

            let totalReq = 0;
            let totalDone = 0;

            deptEmps.forEach(e => {
              deptPOPs.forEach(p => {
                totalReq++;
                const hasAck = acknowledgements.some(a => a.employee_id === e.id && a.pop_id === p.id && a.version_number === p.current_version);
                if (hasAck) totalDone++;
              });
            });

            const rate = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 100;

            return (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Setor: {dept?.name}</h3>
                    <p className="text-xs text-slate-500">Gestor: {dept?.manager_name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600">{rate}%</span>
                    <span className="text-xs text-slate-500 block">Conformidade do Setor</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800">Funcionários Pendentes no Setor:</h4>
                    {deptEmps.map(emp => {
                      const pends = deptPOPs.filter(pop => !acknowledgements.some(a => a.employee_id === emp.id && a.pop_id === pop.id));
                      return (
                        <div key={emp.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                          <span>{emp.full_name}</span>
                          <span className={`font-bold ${pends.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {pends.length > 0 ? `${pends.length} POP(s) Pendente(s)` : '100% Ciente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800">POPs Vinculados ao Setor:</h4>
                    {deptPOPs.map(pop => (
                      <div key={pop.id} className="p-2 bg-white rounded-lg border border-slate-200 font-medium">
                        <span className="font-bold text-blue-900">{pop.code}:</span> {pop.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUBTAB 4: EVIDÊNCIAS AUDITÁVEIS */}
      {subTab === 'evidencias' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Relatório de Evidências Inalteráveis</h3>
              <p className="text-xs text-slate-500">Emissão de certificados individuais com carimbo de tempo, IP e Hash SHA-256</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {acknowledgements.map(ack => {
              const pop = pops.find(p => p.id === ack.pop_id) || { code: ack.pop_code, title: ack.pop_title } as any;
              const emp = employees.find(e => e.id === ack.employee_id) || { full_name: ack.employee_name, cpf: ack.employee_cpf, registration_number: ack.employee_registration } as any;
              const ver = pop.versions?.find((v: any) => v.version_number === ack.version_number) || { published_date: ack.acknowledged_at } as any;

              return (
                <div key={ack.id} className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{ack.employee_name} ({ack.employee_registration})</span>
                    <p className="text-slate-600">POP: <strong>{ack.pop_code} (V{ack.version_number})</strong> - {ack.pop_title}</p>
                    <span className="text-[10px] font-mono text-slate-400">Transação: {ack.transaction_id} | IP: {ack.ip_address}</span>
                  </div>

                  <button
                    onClick={() => generateEvidenceReportPDF(ack, emp, pop, ver)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar Certificado PDF
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
