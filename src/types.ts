export type UserRole = 'ADMINISTRADOR' | 'GESTOR' | 'RH' | 'FUNCIONARIO';

export type POPStatus = 
  | 'rascunho'
  | 'em_revisao'
  | 'em_aprovacao'
  | 'aprovado'
  | 'publicado'
  | 'reprovado'
  | 'obsoleto';

export type RevisionPeriodMonths = 3 | 6 | 12 | 24;

export interface Company {
  id: string;
  corporate_name: string; // Razão Social
  trade_name: string;     // Nome Fantasia
  cnpj: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  company_name?: string;
  code?: string;
  name: string;
  manager_name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  company_id: string;
  department_id: string;
  company_name?: string;
  department_name?: string;
  code?: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  company_id: string;
  department_id: string;
  position_id: string;
  company_name?: string;
  department_name?: string;
  position_title?: string;
  full_name: string;
  cpf: string;
  registration_number: string; // Matrícula
  email: string;
  phone?: string;
  role: UserRole;
  admission_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface POPStep {
  id: string;
  step_number: string; // e.g., "5.1", "5.2"
  title: string;
  description: string;
  warning?: string;
  image_url?: string;
  image_caption?: string;
}

export interface POPContent {
  objective: string;          // 1. OBJETIVO
  application: string;        // 2. APLICAÇÃO
  responsibilities: string;   // 3. RESPONSABILIDADES
  materials: string;          // 4. MATERIAIS E EQUIPAMENTOS
  steps: POPStep[];           // 5. PROCEDIMENTO (Passos numerados)
  risks_and_care: string;     // 6. CUIDADOS / RISCOS
  related_documents: string;  // 7. DOCUMENTOS RELACIONADOS
  history_notes?: string;     // 8. OBSERVAÇÕES DE ALTERAÇÃO
}

export interface POPAttachment {
  id: string;
  pop_version_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface POPVersion {
  id: string;
  pop_id: string;
  version_number: string; // "01", "02", "03"
  content: POPContent;
  change_reason: string;
  author_id: string;
  author_name: string;
  reviewer_id?: string;
  reviewer_name?: string;
  approver_id?: string;
  approver_name?: string;
  approval_date?: string;
  published_date?: string;
  rejection_reason?: string;
  status: POPStatus;
  document_hash: string;
  created_at: string;
  attachments?: POPAttachment[];
}

export interface POPChangeLog {
  id: string;
  pop_id: string;
  pop_version_id?: string;
  version_number: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  change_reason: string;
  created_at: string;
}

export interface POP {
  id: string;
  company_id: string;
  department_id: string;
  company_name?: string;
  department_name?: string;
  code: string;               // e.g., "POP-PROD-001"
  title: string;
  author_id: string;
  author_name: string;
  responsible_name: string;
  classification: string;     // e.g., "Segurança e Operação"
  current_version: string;    // "03"
  status: POPStatus;
  review_period_months: RevisionPeriodMonths;
  last_review_date?: string;
  next_review_date: string;
  created_at: string;
  updated_at: string;
  assigned_department_ids?: string[];
  assigned_position_ids?: string[];
  versions?: POPVersion[];
  change_history?: POPChangeLog[];
}

export interface POPAssignment {
  id: string;
  pop_id: string;
  department_id?: string;
  position_id?: string;
  created_at: string;
}

export type ConfirmationType = 'eletronica' | 'assinatura_desenhada' | 'govbr_simulado';

export interface Acknowledgement {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_cpf: string;
  employee_registration: string;
  pop_id: string;
  pop_code: string;
  pop_title: string;
  pop_version_id: string;
  version_number: string;
  acknowledged_at: string;
  confirmation_type: ConfirmationType;
  ip_address: string;
  user_agent: string;
  document_hash: string;
  term_text: string;
  signature_url?: string;
  transaction_id?: string;
}

export interface SignatureRecord {
  id: string;
  acknowledgement_id: string;
  employee_id: string;
  employee_name: string;
  document_code: string;
  document_version: string;
  signature_data_url?: string;
  transaction_id: string;
  signature_type: 'assinatura_eletronica_simples' | 'assinatura_desenhada' | 'govbr_preparado';
  signed_at: string;
}

export interface Approval {
  id: string;
  pop_version_id: string;
  pop_code: string;
  pop_title: string;
  version_number: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: 'submetido' | 'aprovado' | 'reprovado';
  comments?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  action: string; // e.g. "CRIAÇÃO DE POP", "PUBLICAÇÃO", "CIÊNCIA"
  entity_name: string;
  entity_id?: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  employee_id: string;
  target_role?: UserRole;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  link?: string;
  email_sent?: boolean;
  created_at: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_role: UserRole;
  subject: string;
  body: string;
  pop_code?: string;
  sent_at: string;
  status: 'entregue' | 'enviado' | 'falha';
}

export interface EmployeeComplianceSummary {
  employee: Employee;
  mandatoryPopsCount: number;
  completedPopsCount: number;
  pendingPopsCount: number;
  expiredPopsCount: number;
  compliancePercentage: number;
  status: '100% Ciente' | 'Pendente' | 'Crítico';
}

export interface SectorComplianceSummary {
  department: Department;
  totalEmployees: number;
  fullScienceEmployees: number;
  pendingEmployees: number;
  compliancePercentage: number;
}
