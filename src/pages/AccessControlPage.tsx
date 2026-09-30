import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  User, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Plus, 
  Edit3, 
  Trash2,
  Loader2,
  AlertTriangle,
  Key,
  Settings2, 
  Building2, 
  FileText, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Employee, UserRole } from '../types';

export const AccessControlPage: React.FC = () => {
  const { 
    currentUser, 
    allUsersList, 
    isSuperAdmin, 
    isSectorAdmin, 
    isStandardUser,
    approveUser,
    toggleUserBlock,
    updateGranularPermissions,
    assignAdminSectors,
    updateUser,
    deleteUser,
    canManageUser
  } = useAuth();

  const { departments } = useData();

  // Active tab inside RBAC
  const [activeTab, setActiveTab] = useState<'pending' | 'admins' | 'sector_users' | 'my_access'>(() => {
    if (isSuperAdmin()) return 'pending';
    if (isSectorAdmin()) return 'sector_users';
    return 'my_access';
  });

  // Modal for Approving a New User
  const [selectedPendingUser, setSelectedPendingUser] = useState<Employee | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('USUARIO');
  const [selectedManagedDepts, setSelectedManagedDepts] = useState<string[]>([]);

  // Modal for Assigning Sectors to an Admin
  const [selectedAdminForSectors, setSelectedAdminForSectors] = useState<Employee | null>(null);
  const [adminDeptIds, setAdminDeptIds] = useState<string[]>([]);

  // Modal for Editing a User
  const [userToEdit, setUserToEdit] = useState<Employee | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('USUARIO');
  const [editAccountStatus, setEditAccountStatus] = useState<AccountStatus>('APROVADO');
  const [editPassword, setEditPassword] = useState('');
  const [editCanCreatePOP, setEditCanCreatePOP] = useState(false);
  const [editCanEditPOP, setEditCanEditPOP] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Modal for Deleting a User
  const [userToDelete, setUserToDelete] = useState<Employee | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Filter pending users
  const pendingUsers = allUsersList.filter(u => u.account_status === 'PENDENTE');
  const adminUsers = allUsersList.filter(u => u.role === 'ADMIN' || u.role === 'GESTOR');

  // Filter users belonging to current sector admin's managed departments
  const managedDeptIds = isSuperAdmin() 
    ? departments.map(d => d.id) 
    : (currentUser?.managed_department_ids || [currentUser?.department_id || '']);

  const sectorUsers = allUsersList.filter(u => {
    if (isSuperAdmin()) return true;
    return managedDeptIds.includes(u.department_id) && u.role === 'USUARIO';
  });

  const handleOpenApproveModal = (user: Employee) => {
    setSelectedPendingUser(user);
    setTargetRole('USUARIO');
    setSelectedManagedDepts([user.department_id]);
  };

  const handleConfirmApproval = () => {
    if (!selectedPendingUser) return;
    approveUser(
      selectedPendingUser.id, 
      targetRole, 
      targetRole === 'ADMIN' ? selectedManagedDepts : undefined
    );
    setSelectedPendingUser(null);
  };

  const handleOpenAdminSectorsModal = (admin: Employee) => {
    setSelectedAdminForSectors(admin);
    setAdminDeptIds(admin.managed_department_ids || [admin.department_id]);
  };

  const handleSaveAdminSectors = () => {
    if (!selectedAdminForSectors) return;
    assignAdminSectors(selectedAdminForSectors.id, adminDeptIds);
    setSelectedAdminForSectors(null);
  };

  const handleOpenEditUser = (user: Employee) => {
    setUserToEdit(user);
    setEditFullName(user.full_name);
    setEditCpf(user.cpf);
    setEditEmail(user.email);
    setEditDeptId(user.department_id);
    setEditRole(user.role);
    setEditAccountStatus(user.account_status);
    setEditPassword('');
    setEditCanCreatePOP(Boolean(user.can_create_pop));
    setEditCanEditPOP(Boolean(user.can_edit_pop));
  };

  const handleSaveEditedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setIsSavingUser(true);
    try {
      const targetDept = departments.find(d => d.id === editDeptId);
      const payload: Partial<Employee> = {
        full_name: editFullName.trim(),
        cpf: editCpf.trim(),
        email: editEmail.trim(),
        department_id: editDeptId,
        department_name: targetDept?.name || userToEdit.department_name,
        role: editRole,
        account_status: editAccountStatus,
        can_create_pop: editCanCreatePOP,
        can_edit_pop: editCanEditPOP
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }
      await updateUser(userToEdit.id, payload);
      setUserToEdit(null);
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const ok = await deleteUser(userToDelete.id);
      if (ok) {
        setUserToDelete(null);
      } else {
        alert('Não foi possível excluir o usuário no banco de dados. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      alert('Erro ao excluir usuário: ' + (err.message || 'Falha de comunicação.'));
    } finally {
      setIsDeletingUser(false);
    }
  };

  const toggleDeptSelection = (deptId: string) => {
    if (selectedManagedDepts.includes(deptId)) {
      setSelectedManagedDepts(selectedManagedDepts.filter(id => id !== deptId));
    } else {
      setSelectedManagedDepts([...selectedManagedDepts, deptId]);
    }
  };

  const toggleAdminDeptSelection = (deptId: string) => {
    if (adminDeptIds.includes(deptId)) {
      setAdminDeptIds(adminDeptIds.filter(id => id !== deptId));
    } else {
      setAdminDeptIds([...adminDeptIds, deptId]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner / Explanation of the 3 Hierarchical Levels */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl border border-slate-700/80 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Controle de Acesso Baseado em Papéis (RBAC)
              </h1>
              <p className="text-xs text-slate-300">
                Governança estruturada em 3 níveis de autoridade para gestão e compliance de POPs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-white/10 border border-white/20 rounded-full text-slate-200">
              Seu Perfil Atual: <strong className="text-white">{currentUser?.role}</strong>
            </span>
          </div>
        </div>

        {/* 3 Pillars Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-700/60">
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-start gap-2.5">
            <Crown className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-purple-300 block">1. SUPER ADMIN</span>
              <span className="text-[11px] text-slate-300">Controle total, aprova novos cadastros e vincula setores aos Admins.</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-start gap-2.5">
            <Briefcase className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-blue-300 block">2. ADMIN (GESTOR)</span>
              <span className="text-[11px] text-slate-300">Permissão total nos POPs delegados, bloqueia/libera e concede permissões ao setor.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-600/30 rounded-2xl flex items-start gap-2.5">
            <User className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-200 block">3. USUÁRIO (PADRÃO)</span>
              <span className="text-[11px] text-slate-300">Acesso restrito ao próprio setor. Leitura por padrão; cria/edita só se autorizado.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {isSuperAdmin() && (
          <>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Aprovações Pendentes ({pendingUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'admins'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Gestores & Setores Vinculados ({adminUsers.length})</span>
            </button>
          </>
        )}

        {(isSuperAdmin() || isSectorAdmin()) && (
          <button
            onClick={() => setActiveTab('sector_users')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'sector_users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Colaboradores do Setor & Permissões ({sectorUsers.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('my_access')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'my_access'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meu Acesso & Privilégios</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: APROVAÇÕES PENDENTES (SUPER ADMIN) */}
      {/* ============================================================== */}
      {activeTab === 'pending' && isSuperAdmin() && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Novas Contas Aguardando Homologação
              </h2>
              <p className="text-xs text-slate-500">
                Como Super Administrador, aprove o acesso e defina o papel inicial de cada solicitante.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
              {pendingUsers.length} solicitação(ões) pendente(s)
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="font-bold text-slate-700 text-sm">Nenhum cadastro aguardando aprovação.</p>
              <p className="text-xs">Todas as novas contas solicitadas já foram homologadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="py-3 px-4">Colaborador / CPF</th>
                    <th className="py-3 px-4">Setor Solicitado</th>
                    <th className="py-3 px-4">Data da Solicitação</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação do Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pendingUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{user.full_name}</div>
                        <div className="text-[11px] text-slate-500">{user.email} &bull; CPF: {user.cpf}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {user.department_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-bold text-[10px]">
                          AGUARDANDO APROVAÇÃO
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenApproveModal(user)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                            title="Homologar e liberar acesso"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Homologar Acesso</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors"
                            title="Editar dados cadastrais do solicitante"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors"
                            title="Rejeitar / Excluir solicitação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: GESTORES & SETORES VINCULADOS (SUPER ADMIN) */}
      {/* ============================================================== */}
      {activeTab === 'admins' && isSuperAdmin() && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Atribuição de Setores aos Admins (Gestores)
              </h2>
              <p className="text-xs text-slate-500">
                O Super Admin vincula quais setores cada Admin tem autoridade para criar, editar, excluir POPs e gerenciar usuários.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminUsers.map(admin => {
              const managedNames = (admin.managed_department_ids || [admin.department_id])
                .map(id => departments.find(d => d.id === id)?.name || id);

              return (
                <div key={admin.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {admin.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{admin.full_name}</h3>
                          <span className="text-[11px] text-slate-500">{admin.email}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-md text-[10px] font-extrabold">
                        ADMIN DE SETOR
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                        Setores Sob Responsabilidade Delegada:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {managedNames.map((name, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditUser(admin)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-200"
                        title="Editar dados cadastrais do gestor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      {admin.id !== currentUser?.id && (
                        <button
                          onClick={() => setUserToDelete(admin)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                          title="Excluir gestor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleOpenAdminSectorsModal(admin)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Configurar Setores Vinculados</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: COLABORADORES DO SETOR & PERMISSÕES GRANULARES (ADMIN / SUPER) */}
      {/* ============================================================== */}
      {activeTab === 'sector_users' && (isSuperAdmin() || isSectorAdmin()) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Gestão de Usuários & Permissões Granulares do Setor
              </h2>
              <p className="text-xs text-slate-500">
                {isSuperAdmin() 
                  ? 'Visão Global de todos os colaboradores e concessão de direitos de criação/edição.' 
                  : 'Gerencie os usuários do seu setor: libere ou bloqueie o acesso e conceda permissão para Criar ou Editar POPs.'}
              </p>
            </div>
            <div className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Setor(es) Ativo(s): {isSuperAdmin() ? 'Todos' : (currentUser?.department_name || 'Produção')}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Status de Acesso</th>
                  <th className="py-3 px-4 text-center">Pode Criar POPs?</th>
                  <th className="py-3 px-4 text-center">Pode Editar POPs?</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sectorUsers.map(user => {
                  const isBlocked = user.account_status === 'BLOQUEADO';
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${isBlocked ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{user.full_name}</div>
                        <div className="text-[11px] text-slate-500">{user.email} &bull; CPF: {user.cpf}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {user.department_name}
                      </td>
                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-md font-bold text-[10px] flex items-center gap-1 w-max">
                            <Lock className="w-3 h-3 text-rose-600" /> BLOQUEADO
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[10px] flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> LIBERADO
                          </span>
                        )}
                      </td>

                      {/* Granular Permission: Can Create */}
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={isBlocked}
                          onClick={() => updateGranularPermissions(user.id, { can_create_pop: !user.can_create_pop })}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all disabled:opacity-30 ${
                            user.can_create_pop 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Clique para alternar permissão de criar POPs"
                        >
                          {user.can_create_pop ? '✓ Permitido' : '✕ Bloqueado'}
                        </button>
                      </td>

                      {/* Granular Permission: Can Edit */}
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={isBlocked}
                          onClick={() => updateGranularPermissions(user.id, { can_edit_pop: !user.can_edit_pop })}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all disabled:opacity-30 ${
                            user.can_edit_pop 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Clique para alternar permissão de editar POPs"
                        >
                          {user.can_edit_pop ? '✓ Permitido' : '✕ Bloqueado'}
                        </button>
                      </td>

                      {/* User Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleUserBlock(user.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                            title={isBlocked ? "Desbloquear Acesso" : "Bloquear Usuário"}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Desbloquear</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Bloquear</span>
                              </>
                            )}
                          </button>

                          {canManageUser(user) && (
                            <>
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors"
                                title="Editar dados do colaborador"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors"
                                  title="Excluir colaborador"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 4: MEU ACESSO & PRIVILÉGIOS (QUALQUER USUÁRIO) */}
      {/* ============================================================== */}
      {activeTab === 'my_access' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{currentUser?.full_name}</h2>
              <p className="text-xs text-slate-500">{currentUser?.email} &bull; CPF: {currentUser?.cpf}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Papel Hierárquico</span>
              <div className="font-extrabold text-blue-900 text-sm">{currentUser?.role}</div>
              <span className="text-[11px] text-slate-500">
                {isSuperAdmin() && 'Administrador Geral do Sistema'}
                {isSectorAdmin() && 'Gestor Delegado de Setor'}
                {isStandardUser() && 'Colaborador Operacional'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Setor de Atuação</span>
              <div className="font-extrabold text-slate-900 text-sm">{currentUser?.department_name || 'Produção'}</div>
              <span className="text-[11px] text-slate-500">Rufato Móveis</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Status da Conta</span>
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-xs">
                  {currentUser?.account_status || 'APROVADO'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Credencial Ativa</span>
            </div>
          </div>

          {/* Granular Permissions Status for Standard User */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Suas Permissões Efetivas de Gestão de POPs:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span>Leitura / Consulta de POPs:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold">
                  ✓ Liberado
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span>Criação de Novos POPs:</span>
                {currentUser?.can_create_pop || isSuperAdmin() || isSectorAdmin() ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold">
                    ✓ Autorizado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md font-bold">
                    ✕ Apenas Leitura
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <span>Edição de POPs do Setor:</span>
                {currentUser?.can_edit_pop || isSuperAdmin() || isSectorAdmin() ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold">
                    ✓ Autorizado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md font-bold">
                    ✕ Bloqueado
                  </span>
                )}
              </div>
            </div>

            {isStandardUser() && !currentUser?.can_create_pop && (
              <p className="text-[11px] text-slate-400 italic">
                * Conforme a política de governança, permissões para criar ou editar procedimentos operacionais devem ser solicitadas diretamente ao Administrador/Gestor do seu setor.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: HOMOLOGAÇÃO DE NOVO CADASTRO (SUPER ADMIN) */}
      {/* ============================================================== */}
      {selectedPendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                Homologação de Nova Conta & Papel Inicial
              </h3>
              <button onClick={() => setSelectedPendingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><strong>Nome:</strong> {selectedPendingUser.full_name}</div>
              <div><strong>E-mail:</strong> {selectedPendingUser.email}</div>
              <div><strong>CPF:</strong> {selectedPendingUser.cpf} &bull; <strong>Setor:</strong> {selectedPendingUser.department_name}</div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">Selecione o Nível Hierárquico Inicial (RBAC):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetRole('USUARIO')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetRole === 'USUARIO'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">USUÁRIO</div>
                  <div className="text-[10px] text-slate-500 font-normal">Colaborador padrão (leitura restrita ao setor)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetRole === 'ADMIN'
                      ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">ADMIN</div>
                  <div className="text-[10px] text-slate-500 font-normal">Gestor de Setor (controle total de POPs delegados)</div>
                </button>
              </div>
            </div>

            {targetRole === 'ADMIN' && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-800 block">Vincular Setores Sob a Gestão Deste Admin:</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {departments.map(dept => {
                    const isChecked = selectedManagedDepts.includes(dept.id);
                    return (
                      <label 
                        key={dept.id} 
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-100 font-bold text-blue-900' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDeptSelection(dept.id)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="truncate">{dept.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedPendingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Aprovar & Liberar Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIGURAR SETORES DELEGADOS A UM ADMIN (SUPER ADMIN) */}
      {/* ============================================================== */}
      {selectedAdminForSectors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-purple-600" />
                Vincular Setores Delegados ao Admin
              </h3>
              <button onClick={() => setSelectedAdminForSectors(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Selecione os setores sobre os quais <strong>{selectedAdminForSectors.full_name}</strong> terá poderes de criar, editar, excluir POPs e gerenciar usuários:
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {departments.map(dept => {
                const isChecked = adminDeptIds.includes(dept.id);
                return (
                  <label 
                    key={dept.id} 
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-purple-100 font-bold text-purple-900' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAdminDeptSelection(dept.id)}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                    <span className="truncate">{dept.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedAdminForSectors(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdminSectors}
                className="px-5 py-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
              >
                Salvar Vinculação de Setores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR CADASTRO DO USUÁRIO */}
      {/* ============================================================== */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span>Editar Dados do Usuário</span>
              </h3>
              <button 
                onClick={() => setUserToEdit(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">CPF *</label>
                  <input
                    type="text"
                    required
                    value={editCpf}
                    onChange={e => setEditCpf(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Setor de Lotação *</label>
                  <select
                    value={editDeptId}
                    onChange={e => setEditDeptId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Nível Hierárquico (RBAC) *</label>
                  <select
                    disabled={!isSuperAdmin()}
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:bg-slate-200"
                  >
                    <option value="USUARIO">USUÁRIO (Padrão)</option>
                    <option value="ADMIN">ADMIN (Gestor de Setor)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Global)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Status da Conta *</label>
                  <select
                    value={editAccountStatus}
                    onChange={e => setEditAccountStatus(e.target.value as AccountStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="APROVADO">APROVADO (Acesso Liberado)</option>
                    <option value="PENDENTE">PENDENTE (Aguardando Aprovação)</option>
                    <option value="BLOQUEADO">BLOQUEADO (Acesso Revogado)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Redefinir Senha (opcional)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Em branco para manter atual"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Permissões Granulares (para usuários padrão) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Permissões Operacionais Granulares:</span>
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editCanCreatePOP}
                      onChange={e => setEditCanCreatePOP(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Permitir Criar Novos POPs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editCanEditPOP}
                      onChange={e => setEditCanEditPOP(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Permitir Editar POPs do Setor</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={isSavingUser}
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE USUÁRIO */}
      {/* ============================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                Excluir Usuário Permanentemente?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você está prestes a excluir o acesso de{' '}
                <strong className="text-slate-900">{userToDelete.full_name}</strong> ({userToDelete.email}){' '}
                do setor <strong className="text-slate-900">{userToDelete.department_name}</strong>.
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] leading-relaxed">
                ⚠️ <strong>Atenção:</strong> Esta ação é irreversível e removerá as credenciais e vínculos do colaborador no banco MySQL.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
