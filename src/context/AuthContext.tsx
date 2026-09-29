import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole, AccountStatus } from '../types';
import { initialEmployees } from '../data/mockSeed';

interface AuthContextType {
  currentUser: Employee | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  allUsersList: Employee[];
  
  // Login & Registration
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (userData: Partial<Employee>) => Promise<{ success: boolean; message: string }>;
  quickSwitchUser: (user: Employee) => void;
  
  // RBAC Actions (Hierarchical)
  approveUser: (userId: string, role: UserRole, managedDeptIds?: string[]) => void;
  toggleUserBlock: (userId: string) => void;
  updateGranularPermissions: (userId: string, perms: { can_create_pop?: boolean; can_edit_pop?: boolean }) => void;
  assignAdminSectors: (adminId: string, deptIds: string[]) => void;
  
  // RBAC Permission Checkers
  isSuperAdmin: () => boolean;
  isSectorAdmin: () => boolean;
  isStandardUser: () => boolean;
  canManageDepartment: (deptId: string) => boolean;
  canCreatePOP: (deptId?: string) => boolean;
  canEditPOP: (pop: { department_id: string }) => boolean;
  canDeletePOP: (pop: { department_id: string }) => boolean;
  canManageUser: (targetUser: Employee) => boolean;
  getManagedDepartmentIds: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage or initialSeed
  const [allUsersList, setAllUsersList] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('popcontrol_all_users');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários locais:', e);
    }
    return initialEmployees;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    try {
      const savedId = localStorage.getItem('popcontrol_active_user_id');
      if (savedId) {
        const found = allUsersList.find(e => e.id === savedId);
        if (found && found.account_status !== 'BLOQUEADO') return found;
      }
    } catch (e) {
      console.warn('Erro ao recuperar sessão ativa:', e);
    }
    // Default to Super Admin so application starts ready to test
    return allUsersList[0] || null;
  });

  // Persist users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('popcontrol_all_users', JSON.stringify(allUsersList));
    } catch (e) {
      console.warn('Erro ao salvar usuários locais:', e);
    }
  }, [allUsersList]);

  // Keep currentUser synced if their permissions/status change in allUsersList
  useEffect(() => {
    if (currentUser) {
      const fresh = allUsersList.find(u => u.id === currentUser.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
        setCurrentUser(fresh);
      }
    }
  }, [allUsersList]);

  const userRole: UserRole = currentUser?.role || 'USUARIO';
  const isAuthenticated = Boolean(currentUser && currentUser.account_status === 'APROVADO');

  // -------------------------------------------------------------
  // 1. LOGIN & AUTENTICAÇÃO
  // -------------------------------------------------------------
  const login = async (identifier: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Buscar por e-mail, CPF limpo ou matrícula
    const user = allUsersList.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.cpf.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
      u.registration_number.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'Usuário não localizado. Verifique e-mail, CPF ou matrícula.' };
    }

    // Validação de Status Hierárquico
    if (user.account_status === 'PENDENTE') {
      return {
        success: false,
        message: 'Seu cadastro está pendente de aprovação pelo Super Administrador. Aguarde a liberação do acesso.'
      };
    }

    if (user.account_status === 'BLOQUEADO') {
      return {
        success: false,
        message: 'Acesso bloqueado pelo gestor do setor. Entre em contato com a administração.'
      };
    }

    // Validação de senha simples (se informada)
    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    setCurrentUser(user);
    localStorage.setItem('popcontrol_active_user_id', user.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('popcontrol_active_user_id');
  };

  const quickSwitchUser = (user: Employee) => {
    setCurrentUser(user);
    localStorage.setItem('popcontrol_active_user_id', user.id);
  };

  // -------------------------------------------------------------
  // 2. CADASTRO DE NOVAS CONTAS (Entra como PENDENTE)
  // -------------------------------------------------------------
  const register = async (userData: Partial<Employee>): Promise<{ success: boolean; message: string }> => {
    const newId = `emp-${Date.now()}`;
    const newUser: Employee = {
      id: newId,
      company_id: userData.company_id || 'c1111111-1111-1111-1111-111111111111',
      department_id: userData.department_id || 'd1111111-1111-1111-1111-111111111111',
      position_id: userData.position_id || 'p1111111-1111-1111-1111-111111111111',
      full_name: userData.full_name || 'Novo Colaborador',
      cpf: userData.cpf || '',
      registration_number: userData.registration_number || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      email: userData.email || '',
      phone: userData.phone || '',
      password: userData.password || '123',
      role: 'USUARIO', // Sempre inicia como USUARIO
      account_status: 'PENDENTE', // Obrigatório passar pela aprovação do Super Admin
      can_create_pop: false, // Padrão: Apenas leitura
      can_edit_pop: false,   // Padrão: Apenas leitura
      admission_date: new Date().toISOString().split('T')[0],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData
    };

    setAllUsersList(prev => [newUser, ...prev]);

    return {
      success: true,
      message: 'Solicitação de cadastro registrada com sucesso! Ela foi encaminhada para aprovação do Super Administrador.'
    };
  };

  // -------------------------------------------------------------
  // 3. AÇÕES DO SUPER ADMIN (Administrador Global)
  // -------------------------------------------------------------
  // Aprova cadastro e define nível de acesso inicial
  const approveUser = (userId: string, targetRole: UserRole, managedDeptIds?: string[]) => {
    setAllUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          account_status: 'APROVADO',
          role: targetRole,
          managed_department_ids: targetRole === 'ADMIN' ? (managedDeptIds || [u.department_id]) : undefined,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));
  };

  // Atribui e vincula os ADMINs aos seus respectivos setores de responsabilidade
  const assignAdminSectors = (adminId: string, deptIds: string[]) => {
    setAllUsersList(prev => prev.map(u => {
      if (u.id === adminId) {
        return {
          ...u,
          role: 'ADMIN',
          managed_department_ids: deptIds,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));
  };

  // -------------------------------------------------------------
  // 4. AÇÕES DO ADMIN (Gestor de Setor) E SUPER ADMIN
  // -------------------------------------------------------------
  // Liberar ou bloquear acesso de colaboradores do setor
  const toggleUserBlock = (userId: string) => {
    setAllUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus: AccountStatus = u.account_status === 'BLOQUEADO' ? 'APROVADO' : 'BLOQUEADO';
        return {
          ...u,
          account_status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));
  };

  // Conceder permissões granulares aos usuários do setor
  const updateGranularPermissions = (userId: string, perms: { can_create_pop?: boolean; can_edit_pop?: boolean }) => {
    setAllUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          can_create_pop: perms.can_create_pop !== undefined ? perms.can_create_pop : u.can_create_pop,
          can_edit_pop: perms.can_edit_pop !== undefined ? perms.can_edit_pop : u.can_edit_pop,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));
  };

  // -------------------------------------------------------------
  // 5. CHECADORES DE PERMISSÃO HIERÁRQUICA (RBAC)
  // -------------------------------------------------------------
  const isSuperAdmin = () => {
    return currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMINISTRADOR';
  };

  const isSectorAdmin = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'GESTOR';
  };

  const isStandardUser = () => {
    return !isSuperAdmin() && !isSectorAdmin();
  };

  const getManagedDepartmentIds = (): string[] => {
    if (isSuperAdmin()) return ['*'];
    if (isSectorAdmin()) {
      return currentUser?.managed_department_ids || [currentUser?.department_id || ''];
    }
    return [currentUser?.department_id || ''];
  };

  const canManageDepartment = (deptId: string): boolean => {
    if (isSuperAdmin()) return true;
    if (isSectorAdmin()) {
      const managed = currentUser?.managed_department_ids || [currentUser?.department_id || ''];
      return managed.includes(deptId);
    }
    return false;
  };

  // Nível 1, 2 e 3 de criação de POP
  const canCreatePOP = (deptId?: string): boolean => {
    // 1. Super Admin: Permissão irrestrita
    if (isSuperAdmin()) return true;

    // 2. Admin: Permissão total sobre os setores delegados
    if (isSectorAdmin()) {
      if (!deptId) return true;
      const managed = currentUser?.managed_department_ids || [currentUser?.department_id || ''];
      return managed.includes(deptId);
    }

    // 3. Usuário: Apenas se tiver recebido permissão explícita do Admin no seu setor
    if (isStandardUser()) {
      if (!currentUser?.can_create_pop) return false;
      if (deptId && deptId !== currentUser.department_id) return false;
      return true;
    }

    return false;
  };

  // Nível 1, 2 e 3 de edição de POP
  const canEditPOP = (pop: { department_id: string }): boolean => {
    // 1. Super Admin: Total
    if (isSuperAdmin()) return true;

    // 2. Admin: Total sobre setores delegados
    if (isSectorAdmin()) {
      const managed = currentUser?.managed_department_ids || [currentUser?.department_id || ''];
      return managed.includes(pop.department_id);
    }

    // 3. Usuário: Apenas se for do seu setor E tiver permissão explícita de edição
    if (isStandardUser()) {
      return (
        pop.department_id === currentUser?.department_id &&
        Boolean(currentUser?.can_edit_pop)
      );
    }

    return false;
  };

  // Nível de exclusão de POP (Apenas Super Admin ou Admin do setor)
  const canDeletePOP = (pop: { department_id: string }): boolean => {
    if (isSuperAdmin()) return true;
    if (isSectorAdmin()) {
      const managed = currentUser?.managed_department_ids || [currentUser?.department_id || ''];
      return managed.includes(pop.department_id);
    }
    return false;
  };

  // Gestão de usuários (Super Admin gerencia todos; Admin gerencia apenas os do seu setor)
  const canManageUser = (targetUser: Employee): boolean => {
    if (isSuperAdmin()) return true;
    if (isSectorAdmin()) {
      // Admin não pode alterar outros Admins ou Super Admin
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN' || targetUser.role === 'ADMINISTRADOR') {
        return false;
      }
      const managed = currentUser?.managed_department_ids || [currentUser?.department_id || ''];
      return managed.includes(targetUser.department_id);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      isAuthenticated,
      allUsersList,
      login,
      logout,
      register,
      quickSwitchUser,
      approveUser,
      toggleUserBlock,
      updateGranularPermissions,
      assignAdminSectors,
      isSuperAdmin,
      isSectorAdmin,
      isStandardUser,
      canManageDepartment,
      canCreatePOP,
      canEditPOP,
      canDeletePOP,
      canManageUser,
      getManagedDepartmentIds
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
