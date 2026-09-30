/**
 * Client HTTP para comunicação do Frontend com a API Node.js / MySQL no CloudPanel.
 */

const API_BASE = '/api';

export const apiClient = {
  // Verificação de status da conexão com MySQL
  async checkHealth(): Promise<{ status: string; database: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('API indisponível');
      return await res.json();
    } catch (e: any) {
      return { status: 'offline', database: 'disconnected' };
    }
  },

  // 1. Empresas
  async getCompanies() {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) throw new Error('Erro ao buscar empresas');
    return res.json();
  },

  async saveCompany(company: any) {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    if (!res.ok) throw new Error('Erro ao salvar empresa');
    return res.json();
  },

  async updateCompany(id: string, company: any) {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    if (!res.ok) throw new Error('Erro ao atualizar empresa');
    return res.json();
  },

  async deleteCompany(id: string) {
    const res = await fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir empresa');
    return res.json();
  },

  // 2. Setores
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Erro ao buscar setores');
    return res.json();
  },

  async saveDepartment(department: any) {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(department)
    });
    if (!res.ok) throw new Error('Erro ao salvar setor');
    return res.json();
  },

  async updateDepartment(id: string, department: any) {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(department)
    });
    if (!res.ok) throw new Error('Erro ao atualizar setor');
    return res.json();
  },

  async deleteDepartment(id: string) {
    const res = await fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir setor');
    return res.json();
  },

  // 3. Cargos
  async getPositions() {
    const res = await fetch(`${API_BASE}/positions`);
    if (!res.ok) throw new Error('Erro ao buscar cargos');
    return res.json();
  },

  async savePosition(position: any) {
    const res = await fetch(`${API_BASE}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position)
    });
    if (!res.ok) throw new Error('Erro ao salvar cargo');
    return res.json();
  },

  async updatePosition(id: string, position: any) {
    const res = await fetch(`${API_BASE}/positions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position)
    });
    if (!res.ok) throw new Error('Erro ao atualizar cargo');
    return res.json();
  },

  async deletePosition(id: string) {
    const res = await fetch(`${API_BASE}/positions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir cargo');
    return res.json();
  },

  // 4. Colaboradores
  async getEmployees() {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error('Erro ao buscar funcionários');
    return res.json();
  },

  async saveEmployee(employee: any) {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!res.ok) throw new Error('Erro ao salvar funcionário');
    return res.json();
  },

  async updateEmployee(id: string, employee: any) {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!res.ok) throw new Error('Erro ao atualizar funcionário');
    return res.json();
  },

  async deleteEmployee(id: string) {
    const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Erro ao excluir funcionário');
    return data;
  },

  // 5. POPs
  async getPOPs() {
    const res = await fetch(`${API_BASE}/pops`);
    if (!res.ok) throw new Error('Erro ao buscar POPs');
    return res.json();
  },

  async createPOP(popPayload: any) {
    const res = await fetch(`${API_BASE}/pops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(popPayload)
    });
    if (!res.ok) throw new Error('Erro ao criar POP no banco');
    return res.json();
  },

  async updatePOP(id: string, popPayload: any) {
    const res = await fetch(`${API_BASE}/pops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(popPayload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar POP no banco');
    return res.json();
  },

  async createPOPVersion(popId: string, versionPayload: any) {
    const res = await fetch(`${API_BASE}/pops/${popId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionPayload)
    });
    if (!res.ok) throw new Error('Erro ao criar versão do POP no banco');
    return res.json();
  },

  async deletePOP(id: string) {
    const res = await fetch(`${API_BASE}/pops/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir POP no banco');
    return res.json();
  },

  // 6. Ciências e Assinaturas
  async getAcknowledgements() {
    const res = await fetch(`${API_BASE}/acknowledgements`);
    if (!res.ok) throw new Error('Erro ao buscar assinaturas');
    return res.json();
  },

  async saveAcknowledgement(ackPayload: any) {
    const res = await fetch(`${API_BASE}/acknowledgements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ackPayload)
    });
    if (!res.ok) throw new Error('Erro ao registrar ciência no banco');
    return res.json();
  },

  // 7. Auditoria
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Erro ao buscar logs de auditoria');
    return res.json();
  },

  async saveAuditLog(logPayload: any) {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logPayload)
    });
    if (!res.ok) throw new Error('Erro ao gravar log de auditoria');
    return res.json();
  },

  // 8. Autenticação & RBAC Real
  async login(identifier: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao autenticar.');
    }
    return data;
  },

  async register(userData: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao registrar usuário.');
    }
    return data;
  },

  async getMe(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Sessão expirada.');
    }
    return res.json();
  },

  async approveUser(userId: string, role: string, managedDeptIds?: string[]) {
    const res = await fetch(`${API_BASE}/auth/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, managedDeptIds })
    });
    if (!res.ok) throw new Error('Erro ao aprovar usuário');
    return res.json();
  },

  async toggleUserBlock(userId: string, newStatus: string) {
    const res = await fetch(`${API_BASE}/auth/toggle-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newStatus })
    });
    if (!res.ok) throw new Error('Erro ao alterar status do usuário');
    return res.json();
  },

  async updatePermissions(userId: string, can_create_pop: boolean, can_edit_pop: boolean) {
    const res = await fetch(`${API_BASE}/auth/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, can_create_pop, can_edit_pop })
    });
    if (!res.ok) throw new Error('Erro ao atualizar permissões');
    return res.json();
  },

  async assignAdminSectors(adminId: string, deptIds: string[]) {
    const res = await fetch(`${API_BASE}/auth/assign-sectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, deptIds })
    });
    if (!res.ok) throw new Error('Erro ao vincular setores');
    return res.json();
  }
};
