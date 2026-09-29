import React, { useState } from 'react';
import { Settings, ShieldCheck, CheckCircle2, Lock, FileText, Database, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const SettingsGovBRPage: React.FC = () => {
  const { resetToDemoData } = useData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          Configurações, Conectividade & Assinatura Digital GOV.BR
        </h2>
        <p className="text-xs text-slate-500">
          Parâmetros do sistema, integração Supabase PostgreSQL e governança jurídica de assinaturas
        </p>
      </div>

      {/* Supabase Integration Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Status de Integração com Supabase (PostgreSQL & Storage)
        </h3>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Conexão com Banco de Dados Supabase:</span>
            <span className="text-slate-600">
              {isSupabaseConfigured 
                ? 'Conectado diretamente ao cluster PostgreSQL do Supabase via VITE_SUPABASE_URL.' 
                : 'Modo de Persistência Híbrida Ativo (Dados persistidos com segurança no local storage / estado reativo).'}
            </span>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {isSupabaseConfigured ? 'Supabase Online' : 'Local Storage Ready'}
          </span>
        </div>
      </div>

      {/* GOV.BR Integration & Legal Framework Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Arquitetura Preparada para Assinatura Qualificada (GOV.BR / ICP-Brasil)
        </h3>

        <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-2">
          <div className="font-bold text-sm">Enquadramento Legal (Lei nº 14.063/2020 & MP 2.200-2/2001)</div>
          <p className="leading-relaxed">
            O POP Control é projetado em conformidade com os três níveis de assinatura eletrônica do Brasil:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Assinatura Eletrônica Simples:</strong> Registra usuário autenticado, timestamp, IP e Hash SHA-256 (Adequada para ciências internas de procedimentos operacionais padrão).</li>
            <li><strong>Assinatura Eletrônica Avançada:</strong> Validação através de chave criptográfica e confirmação de identidade por dois fatores.</li>
            <li><strong>Assinatura Eletrônica Qualificada (GOV.BR / ICP-Brasil):</strong> Utiliza certificados digitais regulamentados pelo ITI para documentos que exijam força executiva e presunção legal absoluta.</li>
          </ul>
        </div>
      </div>

      {/* System Reset Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2 text-rose-700">
          <RotateCcw className="w-4 h-4" />
          Restaurar Dados Demonstrativos
        </h3>
        <p className="text-xs text-slate-600">
          Caso deseje recarregar todos os procedimentos padrão (Rufato Móveis, POP-PROD-001, colaboradores e logs de teste), clique no botão abaixo.
        </p>
        <button
          onClick={() => {
            if (confirm('Deseja realmente restaurar os dados iniciais do POP Control?')) {
              resetToDemoData();
              alert('Dados restaurados com sucesso!');
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-xs"
        >
          Restaurar Dados Demo
        </button>
      </div>
    </div>
  );
};
