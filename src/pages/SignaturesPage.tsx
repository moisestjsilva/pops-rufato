import React, { useState } from 'react';
import { PenTool, Award, Search, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDateTime, maskCPF } from '../utils/helpers';
import { generateEvidenceReportPDF } from '../lib/pdfGenerator';

export const SignaturesPage: React.FC = () => {
  const { acknowledgements, pops, employees } = useData();
  const [search, setSearch] = useState('');

  const filteredAcks = acknowledgements.filter(ack => 
    ack.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    ack.pop_code.toLowerCase().includes(search.toLowerCase()) ||
    ack.transaction_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-500" />
            Registro Central de Ciências & Assinaturas Eletrônicas
          </h2>
          <p className="text-xs text-slate-500">
            Trilha inalterável de evidências de capacitação e confirmações de leitura dos funcionários
          </p>
        </div>

        <div className="relative w-full sm:w-72 text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por funcionário, POP ou transação..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Funcionário / CPF</th>
                <th className="py-3 px-4">POP / Versão</th>
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Tipo Confirmação</th>
                <th className="py-3 px-4">IP Registrado</th>
                <th className="py-3 px-4">Document Hash SHA-256</th>
                <th className="py-3 px-4 text-right">Certificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAcks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum registro de ciência encontrado.
                  </td>
                </tr>
              ) : (
                filteredAcks.map(ack => {
                  const pop = pops.find(p => p.id === ack.pop_id) || {
                    id: ack.pop_id,
                    code: ack.pop_code,
                    title: ack.pop_title,
                    current_version: ack.version_number,
                    classification: 'Operacional',
                    company_name: 'Rufato Móveis'
                  } as any;

                  const emp = employees.find(e => e.id === ack.employee_id) || {
                    id: ack.employee_id,
                    full_name: ack.employee_name,
                    cpf: ack.employee_cpf,
                    registration_number: ack.employee_registration,
                    department_name: 'Produção',
                    position_title: 'Operador'
                  } as any;

                  const ver = pop.versions?.find((v: any) => v.version_number === ack.version_number) || {
                    id: ack.pop_version_id,
                    version_number: ack.version_number,
                    created_at: ack.acknowledged_at
                  };

                  return (
                    <tr key={ack.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ack.employee_name}</div>
                        <div className="text-[11px] text-slate-500">CPF: {maskCPF(ack.employee_cpf)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-900">{ack.pop_code}</span>
                        <span className="ml-1 text-[10px] font-bold text-slate-500">V{ack.version_number}</span>
                        <div className="text-slate-600 line-clamp-1 max-w-xs">{ack.pop_title}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{formatDateTime(ack.acknowledged_at)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ack.confirmation_type.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{ack.ip_address}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={ack.document_hash}>
                        {ack.document_hash}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => generateEvidenceReportPDF(ack, emp, pop, ver)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Award className="w-3.5 h-3.5" /> Evidência PDF
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
    </div>
  );
};
