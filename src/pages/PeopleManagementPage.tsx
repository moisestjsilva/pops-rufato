import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  Search,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Employee, Position, Department, UserRole } from '../types';
import { formatCPF } from '../utils/helpers';

interface PeopleManagementPageProps {
  initialTab?: 'funcionarios' | 'cargos' | 'setores';
}

export const PeopleManagementPage: React.FC<PeopleManagementPageProps> = ({ initialTab = 'funcionarios' }) => {
  const { 
    employees, 
    positions, 
    departments, 
    companies,
    addEmployee, updateEmployee, deleteEmployee,
    addPosition, updatePosition, deletePosition,
    addDepartment, updateDepartment, deleteDepartment
  } = useData();

  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'funcionarios' | 'cargos' | 'setores'>(initialTab);

  // Modals state
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [showPosModal, setShowPosModal] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Search
  const [search, setSearch] = useState('');

  // Form States
  // Employee Form
  const [empName, setEmpName] = useState('');
  const [empCpf, setEmpCpf] = useState('');
  const [empReg, setEmpReg] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDeptId, setEmpDeptId] = useState('');
  const [empPosId, setEmpPosId] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('FUNCIONARIO');

  // Position Form
  const [posTitle, setPosTitle] = useState('');
  const [posCode, setPosCode] = useState('');
  const [posDeptId, setPosDeptId] = useState('');
  const [posDesc, setPosDesc] = useState('');

  // Dept Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptManager, setDeptManager] = useState('');

  // Reset helpers
  const openEmpModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmp(emp);
      setEmpName(emp.full_name);
      setEmpCpf(emp.cpf);
      setEmpReg(emp.registration_number);
      setEmpEmail(emp.email);
      setEmpPhone(emp.phone || '');
      setEmpDeptId(emp.department_id);
      setEmpPosId(emp.position_id);
      setEmpRole(emp.role);
    } else {
      setEditingEmp(null);
      setEmpName('');
      setEmpCpf('');
      setEmpReg(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
      setEmpEmail('');
      setEmpPhone('');
      setEmpDeptId(departments[0]?.id || '');
      setEmpPosId(positions[0]?.id || '');
      setEmpRole('FUNCIONARIO');
    }
    setShowEmpModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        full_name: empName,
        cpf: empCpf,
        registration_number: empReg,
        email: empEmail,
        phone: empPhone,
        department_id: empDeptId,
        position_id: empPosId,
        role: empRole
      });
    } else {
      addEmployee({
        company_id: companies[0]?.id || '',
        department_id: empDeptId || departments[0]?.id || '',
        position_id: empPosId || positions[0]?.id || '',
        full_name: empName,
        cpf: empCpf,
        registration_number: empReg,
        email: empEmail,
        phone: empPhone,
        role: empRole,
        active: true,
        admission_date: new Date().toISOString().split('T')[0]
      });
    }
    setShowEmpModal(false);
  };

  const openPosModal = (pos?: Position) => {
    if (pos) {
      setEditingPos(pos);
      setPosTitle(pos.title);
      setPosCode(pos.code);
      setPosDeptId(pos.department_id);
      setPosDesc(pos.description || '');
    } else {
      setEditingPos(null);
      setPosTitle('');
      setPosCode(`CARG-${Math.floor(100 + Math.random() * 900)}`);
      setPosDeptId(departments[0]?.id || '');
      setPosDesc('');
    }
    setShowPosModal(true);
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPos) {
      updatePosition(editingPos.id, {
        title: posTitle,
        code: posCode,
        department_id: posDeptId,
        description: posDesc
      });
    } else {
      addPosition({
        company_id: companies[0]?.id || '',
        department_id: posDeptId || departments[0]?.id || '',
        title: posTitle,
        code: posCode,
        description: posDesc
      });
    }
    setShowPosModal(false);
  };

  const openDeptModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setDeptName(dept.name);
      setDeptCode(dept.code);
      setDeptManager(dept.manager_name || '');
    } else {
      setEditingDept(null);
      setDeptName('');
      setDeptCode(`SET-${Math.floor(100 + Math.random() * 900)}`);
      setDeptManager('');
    }
    setShowDeptModal(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptName,
        code: deptCode,
        manager_name: deptManager
      });
    } else {
      addDepartment({
        company_id: companies[0]?.id || '',
        name: deptName,
        code: deptCode,
        manager_name: deptManager
      });
    }
    setShowDeptModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">
            Gestão de Pessoas, Cargos & Setores
          </h2>
          <p className="text-xs text-slate-500">
            Mapeamento de colaboradores e hierarquias organizacionais para matriz de ciência
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('funcionarios')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'funcionarios' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Funcionários ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('cargos')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'cargos' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Cargos ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('setores')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'setores' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Setores ({departments.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FUNCIONÁRIOS */}
      {activeTab === 'funcionarios' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72 text-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF ou matrícula..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <button
              onClick={() => openEmpModal()}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Funcionário
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nome / Email</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4">Papel (RBAC)</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {employees.filter(e => e.full_name.toLowerCase().includes(search.toLowerCase()) || e.cpf.includes(search) || e.email.toLowerCase().includes(search.toLowerCase())).map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.full_name}</div>
                      <div className="text-slate-500 text-[11px]">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono font-medium">{formatCPF(emp.cpf)}</td>
                    <td className="py-3 px-4 text-slate-700">{emp.department_name}</td>
                    <td className="py-3 px-4 text-slate-700">{emp.position_title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button onClick={() => openEmpModal(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CARGOS */}
      {activeTab === 'cargos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700">Listagem de Cargos Mapeados</span>
            <button
              onClick={() => openPosModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Cargo
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Título do Cargo</th>
                  <th className="py-3 px-4">Setor Pertencente</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{pos.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{pos.title}</td>
                    <td className="py-3 px-4 text-slate-600">{pos.department_name}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{pos.description || 'N/A'}</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button onClick={() => openPosModal(pos)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePosition(pos.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETORES */}
      {activeTab === 'setores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700">Listagem de Setores e Departamentos</span>
            <button
              onClick={() => openDeptModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Setor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => {
              const deptEmployeesCount = employees.filter(e => e.department_id === dept.id).length;
              const deptPositionsCount = positions.filter(p => p.department_id === dept.id).length;
              return (
                <div key={dept.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-900 text-xs">{dept.code}</span>
                    <button onClick={() => openDeptModal(dept)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">
                      Editar
                    </button>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">{dept.name}</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div><strong>Gestor Responsável:</strong> {dept.manager_name || 'Roberto Líder'}</div>
                    <div><strong>Empresa:</strong> {dept.company_name}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{deptEmployeesCount} Funcionários</span>
                    <span>{deptPositionsCount} Cargos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Employee Form */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingEmp ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
              </h3>
              <button onClick={() => setShowEmpModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome Completo *</label>
                <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
              </div>
              <div>
                <label className="block font-semibold mb-1">CPF *</label>
                <input type="text" value={empCpf} onChange={e => setEmpCpf(e.target.value)} required className="w-full p-2.5 rounded-lg border" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block font-semibold mb-1">E-mail Corporativo *</label>
                <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Setor *</label>
                  <select value={empDeptId} onChange={e => setEmpDeptId(e.target.value)} className="w-full p-2.5 rounded-lg border bg-white">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cargo *</label>
                  <select value={empPosId} onChange={e => setEmpPosId(e.target.value)} className="w-full p-2.5 rounded-lg border bg-white">
                    {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Papel de Acesso (RBAC)</label>
                <select value={empRole} onChange={e => setEmpRole(e.target.value as UserRole)} className="w-full p-2.5 rounded-lg border bg-white">
                  <option value="FUNCIONARIO">FUNCIONÁRIO (Visualiza e assina POPs)</option>
                  <option value="GESTOR">GESTOR (Cria, edita e aprova)</option>
                  <option value="RH">RH / COMPLIANCE (Auditoria e relatórios)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Acesso total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg">Salvar Funcionário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Position Form */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingPos ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}
              </h3>
              <button onClick={() => setShowPosModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSavePosition} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Título do Cargo *</label>
                <input type="text" value={posTitle} onChange={e => setPosTitle(e.target.value)} required className="w-full p-2.5 rounded-lg border" placeholder="Operador de Guilhotina..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Código *</label>
                  <input type="text" value={posCode} onChange={e => setPosCode(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Setor *</label>
                  <select value={posDeptId} onChange={e => setPosDeptId(e.target.value)} className="w-full p-2.5 rounded-lg border bg-white">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPosModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg">Salvar Cargo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dept Form */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingDept ? 'Editar Setor' : 'Cadastrar Novo Setor'}
              </h3>
              <button onClick={() => setShowDeptModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome do Setor / Departamento *</label>
                <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} required className="w-full p-2.5 rounded-lg border" placeholder="Corte e Usinagem..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Código *</label>
                  <input type="text" value={deptCode} onChange={e => setDeptCode(e.target.value)} required className="w-full p-2.5 rounded-lg border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gestor do Setor</label>
                  <input type="text" value={deptManager} onChange={e => setDeptManager(e.target.value)} className="w-full p-2.5 rounded-lg border" placeholder="Nome do Gestor..." />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg">Salvar Setor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
