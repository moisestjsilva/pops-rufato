import React, { useState } from 'react';
import { Building2, Plus, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Company } from '../types';
import { formatCNPJ } from '../utils/helpers';

export const CompaniesPage: React.FC = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<Company | null>(null);

  const [tradeName, setTradeName] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const openModal = (comp?: Company) => {
    if (comp) {
      setEditingComp(comp);
      setTradeName(comp.trade_name);
      setCorporateName(comp.corporate_name);
      setCnpj(comp.cnpj);
      setCity(comp.city || '');
      setState(comp.state || '');
    } else {
      setEditingComp(null);
      setTradeName('');
      setCorporateName('');
      setCnpj('');
      setCity('Ubá');
      setState('MG');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComp) {
      updateCompany(editingComp.id, {
        trade_name: tradeName,
        corporate_name: corporateName,
        cnpj,
        city,
        state
      });
    } else {
      addCompany({
        trade_name: tradeName,
        corporate_name: corporateName,
        cnpj,
        city,
        state,
        active: true
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Empresas & Unidades Fabris (Multi-tenant)
          </h2>
          <p className="text-xs text-slate-500">
            Cadastro de razões sociais e filiais participantes do sistema de compliance
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(comp => (
          <div key={comp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-purple-900 text-sm">{comp.trade_name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openModal(comp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteCompany(comp.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Razão Social:</strong> {comp.corporate_name}</div>
              <div><strong>CNPJ:</strong> {formatCNPJ(comp.cnpj)}</div>
              <div><strong>Localização:</strong> {comp.city || 'Ubá'} - {comp.state || 'MG'}</div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Unidade Ativa
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingComp ? 'Editar Empresa' : 'Cadastrar Empresa'}
              </h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome Fantasia *</label>
                <input type="text" value={tradeName} onChange={e => setTradeName(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Razão Social *</label>
                <input type="text" value={corporateName} onChange={e => setCorporateName(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
              </div>
              <div>
                <label className="block font-semibold mb-1">CNPJ *</label>
                <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Cidade</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full p-2.5 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estado (UF)</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full p-2.5 rounded-lg border" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-bold rounded-lg">Salvar Empresa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
