import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  Department,
  Position,
  Employee,
  POP,
  POPVersion,
  Acknowledgement,
  SignatureRecord,
  Approval,
  AuditLog,
  AppNotification,
  UserRole,
  POPChangeLog,
  EmailNotificationLog
} from '../types';
import {
  initialCompanies,
  initialDepartments,
  initialPositions,
  initialEmployees,
  initialPOPs,
  initialAcknowledgements,
  initialSignatures,
  initialApprovals,
  initialAuditLogs,
  initialNotifications,
  initialChangeLogs,
  initialEmailLogs
} from '../data/mockSeed';
import { generateSimpleHash } from '../utils/helpers';
import { apiClient } from '../lib/api';

interface DataContextType {
  companies: Company[];
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  pops: POP[];
  acknowledgements: Acknowledgement[];
  signatures: SignatureRecord[];
  approvals: Approval[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  changeLogs: POPChangeLog[];
  emailLogs: EmailNotificationLog[];

  // Change Log & Email Helpers
  addPOPChangeLog: (
    popId: string,
    versionNumber: string,
    action: string,
    changeReason: string,
    currentUser: Employee,
    popVersionId?: string
  ) => void;
  sendEmailNotification: (
    recipientEmail: string,
    recipientName: string,
    recipientRole: UserRole,
    subject: string,
    body: string,
    popCode?: string
  ) => void;
  triggerSystemComplianceAlertsScan: () => { createdAlerts: number; sentEmails: number };

  // Companies CRUD
  addCompany: (comp: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Company;
  updateCompany: (id: string, comp: Partial<Company>) => void;
  deleteCompany: (id: string) => boolean;

  // Departments CRUD
  addDepartment: (dept: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Department;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => boolean;

  // Positions CRUD
  addPosition: (pos: Omit<Position, 'id' | 'created_at' | 'updated_at'>) => Position;
  updatePosition: (id: string, pos: Partial<Position>) => void;
  deletePosition: (id: string) => boolean;

  // Employees CRUD
  addEmployee: (emp: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => boolean;

  // POP Actions
  createPOP: (popData: Partial<POP>, initialVersionContent: any, assignedDepts: string[], assignedPos: string[], currentUser: Employee) => POP;
  updatePOP: (popId: string, updatedFields: Partial<POP>, updatedVersionContent?: any, currentUser?: Employee) => void;
  createNewPOPVersion: (popId: string, versionNumber: string, changeReason: string, content: any, currentUser: Employee) => void;
  submitForApproval: (popId: string, versionId: string, currentUser: Employee) => void;
  approvePOPVersion: (popId: string, versionId: string, comments: string, currentUser: Employee, publishImmediately?: boolean) => void;
  rejectPOPVersion: (popId: string, versionId: string, reason: string, currentUser: Employee) => void;
  publishPOPVersion: (popId: string, versionId: string, currentUser: Employee) => void;
  deletePOP: (popId: string, currentUser?: Employee) => Promise<boolean>;

  // Science & Signature
  confirmScience: (
    employeeId: string,
    popId: string,
    versionId: string,
    confirmationType: 'eletronica' | 'assinatura_desenhada' | 'govbr_simulado',
    signatureDataUrl?: string,
    currentUser?: Employee
  ) => Acknowledgement;

  // Audit
  addAuditLog: (action: string, entityName: string, entityId: string, details: string, currentUser: Employee) => void;

  // Notifications
  markNotificationRead: (id: string) => void;

  // Utility
  resetToDemoData: () => void;
}

const STORAGE_PREFIX = 'popcontrol_data_v1_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Failed to load storage key:', key, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage key:', key, e);
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => loadStorage('companies', initialCompanies));
  const [departments, setDepartments] = useState<Department[]>(() => loadStorage('departments', initialDepartments));
  const [positions, setPositions] = useState<Position[]>(() => loadStorage('positions', initialPositions));
  const [employees, setEmployees] = useState<Employee[]>(() => loadStorage('employees', initialEmployees));
  const [pops, setPops] = useState<POP[]>(() => loadStorage('pops', initialPOPs));
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgement[]>(() => loadStorage('acknowledgements', initialAcknowledgements));
  const [signatures, setSignatures] = useState<SignatureRecord[]>(() => loadStorage('signatures', initialSignatures));
  const [approvals, setApprovals] = useState<Approval[]>(() => loadStorage('approvals', initialApprovals));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage('auditLogs', initialAuditLogs));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStorage('notifications', initialNotifications));
  const [changeLogs, setChangeLogs] = useState<POPChangeLog[]>(() => loadStorage('changeLogs', initialChangeLogs));
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() => loadStorage('emailLogs', initialEmailLogs));

  useEffect(() => saveStorage('companies', companies), [companies]);
  useEffect(() => saveStorage('departments', departments), [departments]);
  useEffect(() => saveStorage('positions', positions), [positions]);
  useEffect(() => saveStorage('employees', employees), [employees]);
  useEffect(() => saveStorage('pops', pops), [pops]);
  useEffect(() => saveStorage('acknowledgements', acknowledgements), [acknowledgements]);
  useEffect(() => saveStorage('signatures', signatures), [signatures]);
  useEffect(() => saveStorage('approvals', approvals), [approvals]);
  useEffect(() => saveStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('changeLogs', changeLogs), [changeLogs]);
  useEffect(() => saveStorage('emailLogs', emailLogs), [emailLogs]);

  // Sincronização inicial com o MySQL no CloudPanel
  useEffect(() => {
    async function syncFromMySQL() {
      try {
        const health = await apiClient.checkHealth();
        if (health.status === 'ok' && health.database === 'connected') {
          console.log('[POP CONTROL] Conectado ao MySQL via CloudPanel. Sincronizando dados...');
          const [dbCompanies, dbDepts, dbPositions, dbEmployees, dbPOPs, dbAcks, dbAudit] = await Promise.all([
            apiClient.getCompanies().catch(() => null),
            apiClient.getDepartments().catch(() => null),
            apiClient.getPositions().catch(() => null),
            apiClient.getEmployees().catch(() => null),
            apiClient.getPOPs().catch(() => null),
            apiClient.getAcknowledgements().catch(() => null),
            apiClient.getAuditLogs().catch(() => null)
          ]);

          if (dbCompanies && Array.isArray(dbCompanies) && dbCompanies.length > 0) setCompanies(dbCompanies);
          if (dbDepts && Array.isArray(dbDepts) && dbDepts.length > 0) setDepartments(dbDepts);
          if (dbPositions && Array.isArray(dbPositions) && dbPositions.length > 0) setPositions(dbPositions);
          if (dbEmployees && Array.isArray(dbEmployees) && dbEmployees.length > 0) setEmployees(dbEmployees);
          if (dbPOPs && Array.isArray(dbPOPs) && dbPOPs.length > 0) setPops(dbPOPs);
          if (dbAcks && Array.isArray(dbAcks) && dbAcks.length > 0) setAcknowledgements(dbAcks);
          if (dbAudit && Array.isArray(dbAudit) && dbAudit.length > 0) setAuditLogs(dbAudit);
        }
      } catch (err) {
        console.info('[POP CONTROL] API offline, operando com dados locais/cache.');
      }
    }
    syncFromMySQL();
  }, []);

  // POP Detailed Change History Helper
  const addPOPChangeLog = (
    popId: string,
    versionNumber: string,
    action: string,
    changeReason: string,
    currentUser: Employee,
    popVersionId?: string
  ) => {
    const newLog: POPChangeLog = {
      id: 'chg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      pop_id: popId,
      pop_version_id: popVersionId,
      version_number: versionNumber,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action,
      change_reason: changeReason || 'Alteração técnica registrada no sistema.',
      created_at: new Date().toISOString()
    };
    setChangeLogs(prev => [newLog, ...prev]);
  };

  // Email Notification Dispatch Log Helper
  const sendEmailNotification = (
    recipientEmail: string,
    recipientName: string,
    recipientRole: UserRole,
    subject: string,
    body: string,
    popCode?: string
  ) => {
    const newEmailLog: EmailNotificationLog = {
      id: 'eml-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      recipient_role: recipientRole,
      subject,
      body,
      pop_code: popCode,
      sent_at: new Date().toISOString(),
      status: 'entregue'
    };
    setEmailLogs(prev => [newEmailLog, ...prev]);
  };

  // Compliance Scan for Admin / Manager / Employee Alerts
  const triggerSystemComplianceAlertsScan = () => {
    let createdAlerts = 0;
    let sentEmails = 0;
    const now = new Date();

    // 1. Alerts for ADMINISTRATORS: Check Overdue POPs
    pops.forEach(pop => {
      if (pop.status === 'publicado' && pop.next_review_date) {
        const reviewDate = new Date(pop.next_review_date);
        if (reviewDate < now) {
          // Check if notification already sent recently
          const exists = notifications.some(n => n.link === '/revisoes' && n.message.includes(pop.code));
          if (!exists) {
            const adminEmps = employees.filter(e => e.role === 'ADMINISTRADOR');
            adminEmps.forEach(admin => {
              const notif: AppNotification = {
                id: 'not-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                employee_id: admin.id,
                target_role: 'ADMINISTRADOR',
                title: 'Alerta de POP Vencido (Revisão Periódica)',
                message: `O procedimento ${pop.code} (${pop.title}) ultrapassou a data limite de revisão (${new Date(pop.next_review_date).toLocaleDateString('pt-BR')}).`,
                type: 'alert',
                read: false,
                link: '/revisoes',
                email_sent: true,
                created_at: now.toISOString()
              };
              setNotifications(prev => [notif, ...prev]);
              createdAlerts++;

              sendEmailNotification(
                admin.email,
                admin.full_name,
                admin.role,
                `[POP Control - ALERTA CRÍTICO] POP Vencido: ${pop.code}`,
                `Prezado(a) ${admin.full_name},\n\nO procedimento ${pop.code} - ${pop.title} venceu seu ciclo de revisão em ${new Date(pop.next_review_date).toLocaleDateString('pt-BR')}.\n\nAcesse o sistema para iniciar a revisão ou atribuir um gestor responsável.`,
                pop.code
              );
              sentEmails++;
            });
          }
        }
      }
    });

    // 2. Alerts for MANAGERS: Check Pending Employee Acknowledgments
    const pendingEmpsCountByDept: Record<string, number> = {};
    employees.forEach(emp => {
      const mandatoryPops = pops.filter(p => 
        p.status === 'publicado' && (
          p.assigned_department_ids?.includes(emp.department_id) ||
          p.assigned_position_ids?.includes(emp.position_id)
        )
      );
      const pendingCount = mandatoryPops.filter(p => 
        !acknowledgements.some(a => a.employee_id === emp.id && a.pop_id === p.id && a.version_number === p.current_version)
      ).length;

      if (pendingCount > 0) {
        pendingEmpsCountByDept[emp.department_id] = (pendingEmpsCountByDept[emp.department_id] || 0) + 1;
      }
    });

    Object.entries(pendingEmpsCountByDept).forEach(([deptId, count]) => {
      const managers = employees.filter(e => e.department_id === deptId && (e.role === 'GESTOR' || e.role === 'ADMINISTRADOR'));
      const deptName = departments.find(d => d.id === deptId)?.name || 'Setor';

      managers.forEach(mgr => {
        const notif: AppNotification = {
          id: 'not-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          employee_id: mgr.id,
          target_role: 'GESTOR',
          title: 'Pendência de Ciência dos Colaboradores',
          message: `Existem ${count} colaborador(es) no setor ${deptName} com pendência de assinatura de ciência em POPs vigentes.`,
          type: 'warning',
          read: false,
          link: '/quadro-ciencias',
          email_sent: true,
          created_at: now.toISOString()
        };
        setNotifications(prev => [notif, ...prev]);
        createdAlerts++;

        sendEmailNotification(
          mgr.email,
          mgr.full_name,
          mgr.role,
          `[POP Control] Relatório de Pendências de Ciência - ${deptName}`,
          `Prezado(a) Gestor(a) ${mgr.full_name},\n\nIdentificamos ${count} colaborador(es) no seu setor (${deptName}) com assinaturas pendentes de procedimentos operacionais vigentes.\n\nAcesse o Quadro de Ciências no painel para cobrar a leitura.`,
          undefined
        );
        sentEmails++;
      });
    });

    return { createdAlerts, sentEmails };
  };

  // Audit helper
  const addAuditLog = (action: string, entityName: string, entityId: string, details: string, currentUser: Employee) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      user_name: currentUser.full_name,
      user_email: currentUser.email,
      user_role: currentUser.role,
      action,
      entity_name: entityName,
      entity_id: entityId,
      details,
      ip_address: '189.120.45.100',
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Companies CRUD
  const addCompany = (comp: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Company => {
    const newComp: Company = {
      ...comp,
      id: 'c-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCompanies(prev => [...prev, newComp]);
    apiClient.saveCompany(newComp).catch(err => console.warn('[MySQL] Erro ao salvar empresa:', err));
    return newComp;
  };

  const updateCompany = (id: string, comp: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...comp, updated_at: new Date().toISOString() } : c));
    apiClient.updateCompany(id, comp).catch(err => console.warn('[MySQL] Erro ao atualizar empresa:', err));
  };

  const deleteCompany = (id: string): boolean => {
    const hasDepts = departments.some(d => d.company_id === id);
    if (hasDepts) return false;
    setCompanies(prev => prev.filter(c => c.id !== id));
    apiClient.deleteCompany(id).catch(err => console.warn('[MySQL] Erro ao excluir empresa:', err));
    return true;
  };

  // Departments CRUD
  const addDepartment = (dept: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Department => {
    const comp = companies.find(c => c.id === dept.company_id);
    const newDept: Department = {
      ...dept,
      company_name: comp?.trade_name || comp?.corporate_name || '',
      id: 'd-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDepartments(prev => [...prev, newDept]);
    apiClient.saveDepartment(newDept).catch(err => console.warn('[MySQL] Erro ao salvar setor:', err));
    return newDept;
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...dept, updated_at: new Date().toISOString() } : d));
    apiClient.updateDepartment(id, dept).catch(err => console.warn('[MySQL] Erro ao atualizar setor:', err));
  };

  const deleteDepartment = (id: string): boolean => {
    const hasPositions = positions.some(p => p.department_id === id);
    const hasEmployees = employees.some(e => e.department_id === id);
    if (hasPositions || hasEmployees) return false;
    setDepartments(prev => prev.filter(d => d.id !== id));
    apiClient.deleteDepartment(id).catch(err => console.warn('[MySQL] Erro ao excluir setor:', err));
    return true;
  };

  // Positions CRUD
  const addPosition = (pos: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Position => {
    const comp = companies.find(c => c.id === pos.company_id);
    const dept = departments.find(d => d.id === pos.department_id);
    const newPos: Position = {
      ...pos,
      company_name: comp?.trade_name || '',
      department_name: dept?.name || '',
      id: 'p-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPositions(prev => [...prev, newPos]);
    apiClient.savePosition(newPos).catch(err => console.warn('[MySQL] Erro ao salvar cargo:', err));
    return newPos;
  };

  const updatePosition = (id: string, pos: Partial<Position>) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...pos, updated_at: new Date().toISOString() } : p));
    apiClient.updatePosition(id, pos).catch(err => console.warn('[MySQL] Erro ao atualizar cargo:', err));
  };

  const deletePosition = (id: string): boolean => {
    const hasEmployees = employees.some(e => e.position_id === id);
    if (hasEmployees) return false;
    setPositions(prev => prev.filter(p => p.id !== id));
    apiClient.deletePosition(id).catch(err => console.warn('[MySQL] Erro ao excluir cargo:', err));
    return true;
  };

  // Employees CRUD & Auto POP Assignment Trigger
  const addEmployee = (empData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Employee => {
    const comp = companies.find(c => c.id === empData.company_id);
    const dept = departments.find(d => d.id === empData.department_id);
    const pos = positions.find(p => p.id === empData.position_id);

    const newEmp: Employee = {
      ...empData,
      company_name: comp?.trade_name || '',
      department_name: dept?.name || '',
      position_title: pos?.title || '',
      id: 'e-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEmployees(prev => [...prev, newEmp]);

    // Check published POPs applicable to this department or position
    const mandatoryPops = pops.filter(p => 
      p.status === 'publicado' && (
        p.assigned_department_ids?.includes(newEmp.department_id) ||
        p.assigned_position_ids?.includes(newEmp.position_id)
      )
    );

    // Create notifications for newly assigned mandatory POPs
    mandatoryPops.forEach(pop => {
      const notif: AppNotification = {
        id: 'not-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        employee_id: newEmp.id,
        title: 'POP Obrigatório Atribuído',
        message: `Foi atribuída a você a ciência do procedimento ${pop.code} - ${pop.title} (Versão ${pop.current_version}).`,
        type: 'warning',
        read: false,
        link: `/pops/${pop.id}`,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    });

    apiClient.saveEmployee(newEmp).catch(err => console.warn('[MySQL] Erro ao salvar colaborador:', err));
    return newEmp;
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...emp, updated_at: new Date().toISOString() } : e));
    apiClient.updateEmployee(id, emp).catch(err => console.warn('[MySQL] Erro ao atualizar colaborador:', err));
  };

  const deleteEmployee = (id: string): boolean => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    apiClient.deleteEmployee(id).catch(err => console.warn('[MySQL] Erro ao excluir colaborador:', err));
    return true;
  };

  // POP Creation
  const createPOP = (
    popData: Partial<POP>,
    initialVersionContent: any,
    assignedDepts: string[],
    assignedPos: string[],
    currentUser: Employee
  ): POP => {
    const popId = 'pop-' + Date.now();
    const versionId = 'ver-' + Date.now();

    const dept = departments.find(d => d.id === popData.department_id);
    const comp = companies.find(c => c.id === popData.company_id);

    const now = new Date();
    const reviewMonths = popData.review_period_months || 12;
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + reviewMonths);

    const initialVer: POPVersion = {
      id: versionId,
      pop_id: popId,
      version_number: '01',
      change_reason: 'Elaboração inicial do procedimento operacional padrão.',
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      status: popData.status || 'rascunho',
      document_hash: generateSimpleHash(popData.code + '01' + now.toISOString()),
      created_at: now.toISOString(),
      content: initialVersionContent
    };

    const newPOP: POP = {
      id: popId,
      company_id: popData.company_id || companies[0]?.id || '',
      department_id: popData.department_id || departments[0]?.id || '',
      company_name: comp?.trade_name || '',
      department_name: dept?.name || '',
      code: popData.code || `POP-GEN-${Math.floor(100 + Math.random() * 900)}`,
      title: popData.title || 'Novo Procedimento Operacional',
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      responsible_name: popData.responsible_name || currentUser.full_name,
      classification: popData.classification || 'Operacional',
      current_version: '01',
      status: popData.status || 'rascunho',
      review_period_months: reviewMonths as any,
      last_review_date: undefined,
      next_review_date: nextReview.toISOString().split('T')[0],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      assigned_department_ids: assignedDepts,
      assigned_position_ids: assignedPos,
      versions: [initialVer]
    };

    setPops(prev => [newPOP, ...prev]);

    addAuditLog(
      'CRIAÇÃO DE POP',
      'POP',
      newPOP.code,
      `Criado procedimento ${newPOP.code} - ${newPOP.title} (Versão 01) no setor ${dept?.name || ''}.`,
      currentUser
    );

    addPOPChangeLog(
      popId,
      '01',
      'Criação de POP',
      initialVer.change_reason,
      currentUser,
      versionId
    );

    apiClient.createPOP({
      ...newPOP,
      content: initialVersionContent,
      assigned_department_ids: assignedDepts,
      assigned_position_ids: assignedPos
    }).catch(err => console.warn('[MySQL] Erro ao persistir criação do POP:', err));

    return newPOP;
  };

  const updatePOP = (popId: string, updatedFields: Partial<POP>, updatedVersionContent?: any, currentUser?: Employee) => {
    const targetPOP = pops.find(p => p.id === popId);

    // Compute updated department_name and company_name if department_id or company_id changed
    let extraFields: Partial<POP> = {};
    if (updatedFields.department_id) {
      const targetDept = departments.find(d => d.id === updatedFields.department_id);
      if (targetDept) {
        extraFields.department_name = targetDept.name;
      }
    }
    if (updatedFields.company_id) {
      const targetComp = companies.find(c => c.id === updatedFields.company_id);
      if (targetComp) {
        extraFields.company_name = targetComp.trade_name;
      }
    }

    const payload = {
      ...updatedFields,
      ...extraFields
    };

    apiClient.updatePOP(popId, payload).catch(err => console.warn('[MySQL] Erro ao atualizar POP:', err));

    setPops(prev => prev.map(p => {
      if (p.id !== popId) return p;

      let updatedVersions = p.versions || [];
      if (updatedVersionContent && updatedVersions.length > 0) {
        // Edit latest version content
        updatedVersions = updatedVersions.map((v, idx) => {
          if (idx === updatedVersions.length - 1 || v.version_number === p.current_version) {
            return {
              ...v,
              content: updatedVersionContent,
              document_hash: generateSimpleHash((payload.code || p.code) + v.version_number + JSON.stringify(updatedVersionContent))
            };
          }
          return v;
        });
      }

      return {
        ...p,
        ...payload,
        versions: updatedVersions,
        updated_at: new Date().toISOString()
      };
    }));

    if (currentUser && targetPOP) {
      addAuditLog(
        'EDIÇÃO DE POP',
        'POP',
        popId,
        `Alterado dados do procedimento ${updatedFields.code || targetPOP.code}.`,
        currentUser
      );

      addPOPChangeLog(
        popId,
        targetPOP.current_version,
        'Edição de Conteúdo / Metadados',
        `Edição efetuada no cabeçalho ou corpo do documento por ${currentUser.full_name}.`,
        currentUser
      );
    }
  };

  const deletePOP = async (popId: string, currentUser?: Employee): Promise<boolean> => {
    const target = pops.find(p => p.id === popId);
    if (!target) return false;

    setPops(prev => prev.filter(p => p.id !== popId));

    try {
      await apiClient.deletePOP(popId);
    } catch (err) {
      console.warn('[MySQL] Erro ao excluir POP no banco:', err);
    }

    if (currentUser) {
      addAuditLog(
        'EXCLUSÃO DE POP',
        'POP',
        target.code,
        `Excluído procedimento ${target.code} - ${target.title} do setor ${target.department_name}.`,
        currentUser
      );
    }

    return true;
  };

  const createNewPOPVersion = (popId: string, versionNumber: string, changeReason: string, content: any, currentUser: Employee) => {
    const targetPOP = pops.find(p => p.id === popId);
    if (!targetPOP) return;

    const newVersionId = 'ver-' + Date.now();
    const newVersionObj: POPVersion = {
      id: newVersionId,
      pop_id: popId,
      version_number: versionNumber,
      change_reason: changeReason,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      status: 'em_revisao',
      document_hash: generateSimpleHash(targetPOP.code + versionNumber + new Date().toISOString()),
      created_at: new Date().toISOString(),
      content
    };

    setPops(prev => prev.map(p => {
      if (p.id !== popId) return p;
      return {
        ...p,
        current_version: versionNumber,
        status: 'em_revisao',
        updated_at: new Date().toISOString(),
        versions: [...(p.versions || []), newVersionObj]
      };
    }));

    addAuditLog(
      'NOVA VERSÃO DE POP',
      'POP_VERSION',
      targetPOP.code,
      `Criada nova versão ${versionNumber} para o procedimento ${targetPOP.code}. Motivo: ${changeReason}`,
      currentUser
    );

    addPOPChangeLog(
      popId,
      versionNumber,
      'Nova Versão Criada (Revisão)',
      changeReason,
      currentUser,
      newVersionId
    );
  };

  const submitForApproval = (popId: string, versionId: string, currentUser: Employee) => {
    setPops(prev => prev.map(p => {
      if (p.id !== popId) return p;
      const updatedVers = (p.versions || []).map(v => v.id === versionId ? { ...v, status: 'em_aprovacao' as const } : v);
      return {
        ...p,
        status: 'em_aprovacao',
        versions: updatedVers,
        updated_at: new Date().toISOString()
      };
    }));

    const targetPOP = pops.find(p => p.id === popId);

    // Save approval record
    const appRecord: Approval = {
      id: 'app-' + Date.now(),
      pop_version_id: versionId,
      pop_code: targetPOP?.code || '',
      pop_title: targetPOP?.title || '',
      version_number: targetPOP?.current_version || '01',
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action: 'submetido',
      comments: 'Submetido para aprovação do gestor.',
      created_at: new Date().toISOString()
    };
    setApprovals(prev => [appRecord, ...prev]);

    addAuditLog(
      'ENVIO PARA APROVAÇÃO',
      'POP',
      targetPOP?.code || popId,
      `Procedimento ${targetPOP?.code} enviado para aprovação por ${currentUser.full_name}.`,
      currentUser
    );

    if (targetPOP) {
      addPOPChangeLog(
        popId,
        targetPOP.current_version,
        'Submissão para Aprovação',
        `Submetido para avaliação de compliance por ${currentUser.full_name}.`,
        currentUser,
        versionId
      );

      // Alert Admins/Managers for pending approval
      const approvers = employees.filter(e => e.role === 'ADMINISTRADOR' || (e.role === 'GESTOR' && e.department_id === targetPOP.department_id));
      approvers.forEach(appr => {
        const notif: AppNotification = {
          id: 'not-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          employee_id: appr.id,
          target_role: appr.role,
          title: 'POP Submetido para Aprovação',
          message: `O procedimento ${targetPOP.code} (${targetPOP.title} v${targetPOP.current_version}) requer sua análise e aprovação.`,
          type: 'info',
          read: false,
          link: '/aprovacoes',
          email_sent: true,
          created_at: new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);

        sendEmailNotification(
          appr.email,
          appr.full_name,
          appr.role,
          `[POP Control] Solicitação de Aprovação de POP: ${targetPOP.code}`,
          `Prezado(a) ${appr.full_name},\n\nO procedimento ${targetPOP.code} - ${targetPOP.title} (v${targetPOP.current_version}) foi submetido para sua revisão e aprovação final.\n\nAcesse o menu Aprovações no painel.`,
          targetPOP.code
        );
      });
    }
  };

  const approvePOPVersion = (popId: string, versionId: string, comments: string, currentUser: Employee, publishImmediately = true) => {
    const targetPOP = pops.find(p => p.id === popId);
    if (!targetPOP) return;

    const newStatus = publishImmediately ? 'publicado' : 'aprovado';
    const currentVerNum = targetPOP.versions?.find(v => v.id === versionId)?.version_number || targetPOP.current_version;

    setPops(prev => prev.map(p => {
      if (p.id !== popId) return p;

      // Mark older versions as obsolete if publishing
      const updatedVersions = (p.versions || []).map(v => {
        if (v.id === versionId) {
          return {
            ...v,
            status: newStatus as any,
            approver_id: currentUser.id,
            approver_name: currentUser.full_name,
            approval_date: new Date().toISOString(),
            published_date: publishImmediately ? new Date().toISOString() : undefined
          };
        }
        if (publishImmediately && v.version_number !== currentVerNum) {
          return { ...v, status: 'obsoleto' as const };
        }
        return v;
      });

      const nextRevDate = new Date();
      nextRevDate.setMonth(nextRevDate.getMonth() + p.review_period_months);

      return {
        ...p,
        status: newStatus as any,
        last_review_date: publishImmediately ? new Date().toISOString().split('T')[0] : p.last_review_date,
        next_review_date: publishImmediately ? nextRevDate.toISOString().split('T')[0] : p.next_review_date,
        versions: updatedVersions,
        updated_at: new Date().toISOString()
      };
    }));

    // Save approval action log
    const appRecord: Approval = {
      id: 'app-' + Date.now(),
      pop_version_id: versionId,
      pop_code: targetPOP.code,
      pop_title: targetPOP.title,
      version_number: currentVerNum,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action: 'aprovado',
      comments,
      created_at: new Date().toISOString()
    };
    setApprovals(prev => [appRecord, ...prev]);

    addAuditLog(
      'APROVAÇÃO DE POP',
      'POP',
      targetPOP.code,
      `Procedimento ${targetPOP.code} aprovado por ${currentUser.full_name}. Comentários: ${comments}`,
      currentUser
    );

    addPOPChangeLog(
      popId,
      currentVerNum,
      publishImmediately ? 'Aprovação e Publicação Vigente' : 'Aprovação Formal',
      comments || 'Procedimento aprovado para aplicação operacional.',
      currentUser,
      versionId
    );

    if (publishImmediately) {
      // Trigger notifications for all affected employees
      const affectedEmployees = employees.filter(e => 
        targetPOP.assigned_department_ids?.includes(e.department_id) ||
        targetPOP.assigned_position_ids?.includes(e.position_id)
      );

      affectedEmployees.forEach(emp => {
        const notif: AppNotification = {
          id: 'not-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          employee_id: emp.id,
          target_role: emp.role,
          title: 'Nova Versão de POP Publicada (Ciência Obrigatória)',
          message: `O procedimento ${targetPOP.code} foi publicado em Versão ${currentVerNum}. Sua confirmação de ciência é requerida.`,
          type: 'warning',
          read: false,
          link: `/pops/${targetPOP.id}`,
          email_sent: true,
          created_at: new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);

        sendEmailNotification(
          emp.email,
          emp.full_name,
          emp.role,
          `[POP Control] Novo POP Publicado para seu Cargo: ${targetPOP.code}`,
          `Prezado(a) ${emp.full_name},\n\nO procedimento ${targetPOP.code} - ${targetPOP.title} (v${currentVerNum}) foi publicado oficialmente para a sua função.\n\nAcesse a plataforma POP Control para realizar a leitura e assinar o termo de ciência compulsório.`,
          targetPOP.code
        );
      });
    }
  };

  const rejectPOPVersion = (popId: string, versionId: string, reason: string, currentUser: Employee) => {
    const targetPOP = pops.find(p => p.id === popId);
    if (!targetPOP) return;

    const currentVerNum = targetPOP.versions?.find(v => v.id === versionId)?.version_number || targetPOP.current_version;

    setPops(prev => prev.map(p => {
      if (p.id !== popId) return p;
      const updatedVers = (p.versions || []).map(v => {
        if (v.id === versionId) {
          return {
            ...v,
            status: 'reprovado' as const,
            rejection_reason: reason
          };
        }
        return v;
      });
      return {
        ...p,
        status: 'reprovado',
        versions: updatedVers,
        updated_at: new Date().toISOString()
      };
    }));

    const appRecord: Approval = {
      id: 'app-' + Date.now(),
      pop_version_id: versionId,
      pop_code: targetPOP.code,
      pop_title: targetPOP.title,
      version_number: currentVerNum,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action: 'reprovado',
      comments: reason,
      created_at: new Date().toISOString()
    };
    setApprovals(prev => [appRecord, ...prev]);

    addAuditLog(
      'REPROVAÇÃO DE POP',
      'POP',
      targetPOP.code,
      `Procedimento ${targetPOP.code} reprovado por ${currentUser.full_name}. Motivo: ${reason}`,
      currentUser
    );

    addPOPChangeLog(
      popId,
      currentVerNum,
      'Reprovação de Versão',
      `Reprovado em análise por ${currentUser.full_name}. Motivo: ${reason}`,
      currentUser,
      versionId
    );
  };

  const publishPOPVersion = (popId: string, versionId: string, currentUser: Employee) => {
    approvePOPVersion(popId, versionId, 'Publicação autorizada diretamente pelo administrador/gestor.', currentUser, true);
  };

  // Confirm Science & Signatures
  const confirmScience = (
    employeeId: string,
    popId: string,
    versionId: string,
    confirmationType: 'eletronica' | 'assinatura_desenhada' | 'govbr_simulado',
    signatureDataUrl?: string,
    currentUser?: Employee
  ): Acknowledgement => {
    const targetEmp = employees.find(e => e.id === employeeId);
    const targetPOP = pops.find(p => p.id === popId);
    const targetVer = targetPOP?.versions?.find(v => v.id === versionId);

    const now = new Date();
    const ackId = 'ack-' + Date.now();
    const transactionId = `TX-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${targetEmp?.registration_number || 'EMP'}-${targetVer?.version_number || '01'}`;

    const newAck: Acknowledgement = {
      id: ackId,
      employee_id: employeeId,
      employee_name: targetEmp?.full_name || 'Funcionário',
      employee_cpf: targetEmp?.cpf || '',
      employee_registration: targetEmp?.registration_number || '',
      pop_id: popId,
      pop_code: targetPOP?.code || 'POP',
      pop_title: targetPOP?.title || 'Procedimento',
      pop_version_id: versionId,
      version_number: targetVer?.version_number || targetPOP?.current_version || '01',
      acknowledged_at: now.toISOString(),
      confirmation_type: confirmationType,
      ip_address: '189.120.45.102',
      user_agent: navigator.userAgent,
      document_hash: targetVer?.document_hash || generateSimpleHash(popId + versionId),
      term_text: 'Declaro que li, compreendi e estou ciente deste procedimento, comprometendo-me a seguir as orientações nele estabelecidas.',
      signature_url: signatureDataUrl,
      transaction_id: transactionId
    };

    setAcknowledgements(prev => [newAck, ...prev]);

    apiClient.saveAcknowledgement({
      ...newAck,
      signature_data_url: signatureDataUrl
    }).catch(err => console.warn('[MySQL] Erro ao persistir ciência no MySQL:', err));

    if (signatureDataUrl) {
      const newSig: SignatureRecord = {
        id: 'sig-' + Date.now(),
        acknowledgement_id: ackId,
        employee_id: employeeId,
        employee_name: targetEmp?.full_name || '',
        document_code: targetPOP?.code || '',
        document_version: targetVer?.version_number || '01',
        signature_data_url: signatureDataUrl,
        transaction_id: transactionId,
        signature_type: confirmationType === 'assinatura_desenhada' ? 'assinatura_desenhada' : 'assinatura_eletronica_simples',
        signed_at: now.toISOString()
      };
      setSignatures(prev => [newSig, ...prev]);
    }

    addAuditLog(
      'CONFIRMAÇÃO DE CIÊNCIA',
      'ACKNOWLEDGEMENT',
      targetPOP?.code || popId,
      `Confirmada ciência do ${targetPOP?.code} (Versão ${targetVer?.version_number}) por ${targetEmp?.full_name} (${targetEmp?.registration_number}). Hash: ${newAck.document_hash}`,
      currentUser || { full_name: targetEmp?.full_name || 'Funcionário', email: targetEmp?.email || '', role: 'FUNCIONARIO' } as Employee
    );

    // Mark notifications related to this POP as read
    setNotifications(prev => prev.map(n => 
      n.employee_id === employeeId && n.link?.includes(popId) ? { ...n, read: true } : n
    ));

    return newAck;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const resetToDemoData = () => {
    setCompanies(initialCompanies);
    setDepartments(initialDepartments);
    setPositions(initialPositions);
    setEmployees(initialEmployees);
    setPops(initialPOPs);
    setAcknowledgements(initialAcknowledgements);
    setSignatures(initialSignatures);
    setApprovals(initialApprovals);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    setChangeLogs(initialChangeLogs);
    setEmailLogs(initialEmailLogs);
    localStorage.clear();
  };

  return (
    <DataContext.Provider value={{
      companies,
      departments,
      positions,
      employees,
      pops,
      acknowledgements,
      signatures,
      approvals,
      auditLogs,
      notifications,
      changeLogs,
      emailLogs,
      addPOPChangeLog,
      sendEmailNotification,
      triggerSystemComplianceAlertsScan,
      addCompany,
      updateCompany,
      deleteCompany,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addPosition,
      updatePosition,
      deletePosition,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      createPOP,
      updatePOP,
      deletePOP,
      createNewPOPVersion,
      submitForApproval,
      approvePOPVersion,
      rejectPOPVersion,
      publishPOPVersion,
      confirmScience,
      addAuditLog,
      markNotificationRead,
      resetToDemoData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
