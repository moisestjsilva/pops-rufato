import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole, AccountStatus } from '../types';
import { initialEmployees } from '../data/mockSeed';
import { apiClient } from '../lib/api';

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
  approveUser: (userId: string, role: UserRole, managedDeptIds?: string[]) => Promise<void>;
  toggleUserBlock: (userId: string) => Promise<void>;
  updateGranularPermissions: (userId: string, perms: { can_create_pop?: boolean; can_edit_pop?: boolean }) => Promise<void>;
  assignAdminSectors: (adminId: string, deptIds: string[]) => Promise<void>;
  updateUser: (userId: string, data: Partial<Employee>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  
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
  // Real users list from MySQL backend
  const [allUsersList, setAllUsersList] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('popcontrol_all_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar cache de usuários:', e);
    }
    return initialEmployees;
  });

  // Current logged in user (starts null unless valid session exists)
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    try {
      const savedUser = localStorage.getItem('popcontrol_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.account_status === 'APROVADO') return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão em cache:', e);
    }
    return null;
  });

  // Sync users list from real MySQL database
  const refreshUsersFromBackend = async () => {
    try {
      const dbUsers = await apiClient.getEmployees();
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        setAllUsersList(dbUsers);
        localStorage.setItem('popcontrol_all_users', JSON.stringify(dbUsers));
      }
    } catch (e) {
      console.warn('Não foi possível sincronizar usuários do MySQL (modo offline):', e);
    }
  };

  // Restore authenticated session on mount from real token
  useEffect(() => {
    refreshUsersFromBackend();

    const token = localStorage.getItem('popcontrol_token');
    if (token) {
      apiClient.getMe(token)
        .then(res => {
          if (res.user && res.user.account_status === 'APROVADO') {
            setCurrentUser(res.user);
            localStorage.setItem('popcontrol_current_user', JSON.stringify(res.user));
          } else {
            setCurrentUser(null);
            localStorage.removeItem('popcontrol_token');
            localStorage.removeItem('popcontrol_current_user');
          }
        })
        .catch(() => {
          // If token expired or invalid, clear session
          setCurrentUser(null);
          localStorage.removeItem('popcontrol_token');
          localStorage.removeItem('popcontrol_current_user');
        });
    }
  }, []);

  // Save current user to cache
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('popcontrol_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('popcontrol_current_user');
    }
  }, [currentUser]);

  const userRole: UserRole = currentUser?.role || 'USUARIO';
  const isAuthenticated = Boolean(currentUser && currentUser.account_status === 'APROVADO');

  // -------------------------------------------------------------
  // 1. LOGIN & AUTENTICAÇÃO REAL (MySQL)
  // -------------------------------------------------------------
  const login = async (identifier: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.login(identifier, password);
      if (res.success && res.user) {
        localStorage.setItem('popcontrol_token', res.token);
        localStorage.setItem('popcontrol_active_user_id', res.user.id);
        setCurrentUser(res.user);
        await refreshUsersFromBackend();
        return { success: true };
      }
      return { success: false, message: res.message || 'Credenciais inválidas.' };
    } catch (err: any) {
      // Fallback local caso servidor esteja offline durante desenvolvimento
      console.warn('[AUTH] Falha na chamada da API de login, tentando validação local:', err.message);
      const cleanId = identifier.trim().toLowerCase();
      const user = allUsersList.find(u => 
        u.email.toLowerCase() === cleanId || 
        u.cpf.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
        u.registration_number.toLowerCase() === cleanId
      );

      if (!user) {
        return { success: false, message: err.message || 'Usuário não localizado no sistema.' };
      }
      if (user.account_status === 'PENDENTE') {
        return { success: false, message: 'Seu cadastro está pendente de aprovação pelo Super Administrador.' };
      }
      if (user.account_status === 'BLOQUEADO') {
        return { success: false, message: 'Acesso bloqueado pela administração.' };
      }
      if (password && user.password && user.password !== password) {
        return { success: false, message: 'Senha incorreta. Tente novamente.' };
      }

      setCurrentUser(user);
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('popcontrol_token');
    localStorage.removeItem('popcontrol_current_user');
    localStorage.removeItem('popcontrol_active_user_id');
  };

  const quickSwitchUser = (user: Employee) => {
    setCurrentUser(user);
    localStorage.setItem('popcontrol_current_user', JSON.stringify(user));
    localStorage.setItem('popcontrol_active_user_id', user.id);
  };

  // -------------------------------------------------------------
  // 2. CADASTRO DE NOVAS CONTAS (MySQL Backed)
  // -------------------------------------------------------------
  const register = async (userData: Partial<Employee>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.register(userData);
      await refreshUsersFromBackend();
      return {
        success: true,
        message: res.message || 'Solicitação de cadastro registrada com sucesso! Aguarde a homologação do Super Administrador.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao submeter solicitação de cadastro.'
      };
    }
  };

  // -------------------------------------------------------------
  // 3. AÇÕES DO SUPER ADMIN (Administrador Global)
  // -------------------------------------------------------------
  const approveUser = async (userId: string, targetRole: UserRole, managedDeptIds?: string[]) => {
    // Otimista
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

    try {
      await apiClient.approveUser(userId, targetRole, managedDeptIds);
      await refreshUsersFromBackend();
    } catch (err) {
      console.error('Erro ao aprovar usuário no banco:', err);
    }
  };

  const assignAdminSectors = async (adminId: string, deptIds: string[]) => {
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

    try {
      await apiClient.assignAdminSectors(adminId, deptIds);
      await refreshUsersFromBackend();
    } catch (err) {
      console.error('Erro ao vincular setores no banco:', err);
    }
  };

  // -------------------------------------------------------------
  // 4. AÇÕES DO ADMIN (Gestor de Setor) E SUPER ADMIN
  // -------------------------------------------------------------
  const toggleUserBlock = async (userId: string) => {
    const target = allUsersList.find(u => u.id === userId);
    const newStatus: AccountStatus = target?.account_status === 'BLOQUEADO' ? 'APROVADO' : 'BLOQUEADO';

    setAllUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          account_status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));

    try {
      await apiClient.toggleUserBlock(userId, newStatus);
      await refreshUsersFromBackend();
    } catch (err) {
      console.error('Erro ao alternar bloqueio de usuário no banco:', err);
    }
  };

  const updateGranularPermissions = async (userId: string, perms: { can_create_pop?: boolean; can_edit_pop?: boolean }) => {
    const target = allUsersList.find(u => u.id === userId);
    const canCreate = perms.can_create_pop !== undefined ? perms.can_create_pop : Boolean(target?.can_create_pop);
    const canEdit = perms.can_edit_pop !== undefined ? perms.can_edit_pop : Boolean(target?.can_edit_pop);

    setAllUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          can_create_pop: canCreate,
          can_edit_pop: canEdit,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    }));

    try {
      await apiClient.updatePermissions(userId, canCreate, canEdit);
      await refreshUsersFromBackend();
    } catch (err) {
      console.error('Erro ao atualizar permissões no banco:', err);
    }
  };

  const updateUser = async (userId: string, data: Partial<Employee>): Promise<boolean> => {
    try {
      setAllUsersList(prev => prev.map(u => u.id === userId ? { ...u, ...data, updated_at: new Date().toISOString() } : u));
      if (currentUser?.id === userId) {
        const updated = { ...currentUser, ...data };
        setCurrentUser(updated as Employee);
        localStorage.setItem('popcontrol_current_user', JSON.stringify(updated));
      }
      await apiClient.updateEmployee(userId, data);
      await refreshUsersFromBackend();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      await refreshUsersFromBackend();
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setAllUsersList(prev => prev.filter(u => u.id !== userId));
      await apiClient.deleteEmployee(userId);
      await refreshUsersFromBackend();
      return true;
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      await refreshUsersFromBackend();
      return false;
    }
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
      updateUser,
      deleteUser,
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
