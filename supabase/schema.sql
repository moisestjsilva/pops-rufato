-- POP CONTROL - Schema SQL para Supabase (PostgreSQL)
-- Gestão de Procedimentos Operacionais Padrão e Compliance Operacional

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Setores
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    manager_name VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Cargos
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Funcionários
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Vinculado a auth.users se aplicável
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    full_name VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    registration_number VARCHAR(50) NOT NULL UNIQUE, -- Matrícula
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'FUNCIONARIO' CHECK (role IN ('ADMINISTRADOR', 'GESTOR', 'RH', 'FUNCIONARIO')),
    admission_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela Principal de POPs
CREATE TABLE IF NOT EXISTS public.pops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE, -- Ex: POP-PROD-001
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES public.employees(id),
    responsible_name VARCHAR(150) NOT NULL,
    classification VARCHAR(50) DEFAULT 'Procedimento Operacional',
    current_version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(30) NOT NULL DEFAULT 'rascunho' 
        CHECK (status IN ('rascunho', 'em_revisao', 'em_aprovacao', 'aprovado', 'publicado', 'reprovado', 'obsoleto')),
    review_period_months INT NOT NULL DEFAULT 12 CHECK (review_period_months IN (3, 6, 12, 24)),
    last_review_date DATE,
    next_review_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Versionamento do POP
CREATE TABLE IF NOT EXISTS public.pop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pop_id UUID NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL, -- Ex: 01, 02, 03
    content JSONB NOT NULL, -- Conteúdo estruturado (Objetivo, Aplicação, Passos, etc)
    change_reason TEXT,
    author_id UUID REFERENCES public.employees(id),
    reviewer_id UUID REFERENCES public.employees(id),
    approver_id UUID REFERENCES public.employees(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'rascunho'
        CHECK (status IN ('rascunho', 'em_revisao', 'em_aprovacao', 'aprovado', 'publicado', 'reprovado', 'obsoleto')),
    document_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Anexos do POP
CREATE TABLE IF NOT EXISTS public.pop_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pop_version_id UUID NOT NULL REFERENCES public.pop_versions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'pop-anexos',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Atribuição de POP (Quem deve tomar ciência)
CREATE TABLE IF NOT EXISTS public.pop_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pop_id UUID NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    position_id UUID REFERENCES public.positions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabela de Ciências do Funcionário (Trilha de Evidências)
CREATE TABLE IF NOT EXISTS public.acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    pop_id UUID NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
    pop_version_id UUID NOT NULL REFERENCES public.pop_versions(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmation_type VARCHAR(50) NOT NULL DEFAULT 'eletronica' CHECK (confirmation_type IN ('eletronica', 'assinatura_desenhada', 'govbr_simulado')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    document_hash VARCHAR(128) NOT NULL,
    term_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Assinaturas Eletrônicas
CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    acknowledgement_id UUID NOT NULL REFERENCES public.acknowledgements(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    signature_data_url TEXT, -- Base64 da assinatura desenhada ou hash de token
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    signature_type VARCHAR(50) NOT NULL DEFAULT 'assinatura_eletronica_simples',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabela de Fluxo de Aprovações
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pop_version_id UUID NOT NULL REFERENCES public.pop_versions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.employees(id),
    action VARCHAR(30) NOT NULL CHECK (action IN ('submetido', 'aprovado', 'reprovado')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Tabela de Log de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(200) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    target_role VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    link VARCHAR(255),
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Tabela de Histórico Detalhado de Alterações (Change Logs de POP)
CREATE TABLE IF NOT EXISTS public.pop_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pop_id UUID NOT NULL REFERENCES public.pops(id) ON DELETE CASCADE,
    pop_version_id UUID REFERENCES public.pop_versions(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES public.employees(id),
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    change_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Tabela de Histórico de Disparo de E-mails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(200) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    pop_code VARCHAR(50),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'entregue'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_pops_status ON public.pops(status);
CREATE INDEX IF NOT EXISTS idx_pops_department ON public.pops(department_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgements_emp_ver ON public.acknowledgements(employee_id, pop_version_id);

-- Configuração de RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso permissivas para leitura e escrita autenticada na demo
CREATE POLICY "Permitir leitura geral" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.pops FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.pop_versions FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.acknowledgements FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.signatures FOR SELECT USING (true);
CREATE POLICY "Permitir leitura geral" ON public.audit_logs FOR SELECT USING (true);
