-- POP CONTROL - Seed Data Inicial para Supabase
-- Empresa de Exemplo: Rufato Indústria de Móveis

-- 1. Inserir Empresa
INSERT INTO public.companies (id, corporate_name, trade_name, cnpj, status)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'Rufato Indústria e Comércio de Móveis Ltda',
    'Rufato Indústria de Móveis',
    '12.345.678/0001-99',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Setores
INSERT INTO public.departments (id, company_id, name, manager_name, status) VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Produção', 'Roberto Líder', 'active'),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Expedição', 'Marcos Logística', 'active'),
('d3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Administrativo', 'Carlos Admin', 'active'),
('d4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Comercial', 'Juliana Vendas', 'active'),
('d5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'E-commerce', 'Renata Digital', 'active'),
('d6666666-6666-6666-6666-666666666666', 'c1111111-1111-1111-1111-111111111111', 'Manutenção', 'André Manutenção', 'active'),
('d7777777-7777-7777-7777-777777777777', 'c1111111-1111-1111-1111-111111111111', 'PCP', 'Luciana Planejamento', 'active'),
('d8888888-8888-8888-8888-888888888888', 'c1111111-1111-1111-1111-111111111111', 'RH', 'Fernanda RH', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Cargos
INSERT INTO public.positions (id, company_id, department_id, title, status) VALUES
('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Operador de Máquina de Corte', 'active'),
('p2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Auxiliar de Produção', 'active'),
('p3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Líder de Produção', 'active'),
('p4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Auxiliar de Expedição', 'active'),
('p5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'Gerente Administrativo', 'active'),
('p6666666-6666-6666-6666-666666666666', 'c1111111-1111-1111-1111-111111111111', 'd8888888-8888-8888-8888-888888888888', 'Analista de RH & Compliance', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Funcionários Fictícios
INSERT INTO public.employees (id, company_id, department_id, position_id, full_name, cpf, registration_number, email, phone, role, admission_date, status) VALUES
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'p5555555-5555-5555-5555-555555555555', 'Carlos Eduardo Admin', '111.222.333-44', '00101', 'carlos.admin@rufato.com.br', '(11) 98888-1001', 'ADMINISTRADOR', '2020-01-15', 'active'),
('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333', 'Roberto Líder de Produção', '222.333.444-55', '00204', 'roberto.gestor@rufato.com.br', '(11) 98888-2002', 'GESTOR', '2021-03-10', 'active'),
('e3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'd8888888-8888-8888-8888-888888888888', 'p6666666-6666-6666-6666-666666666666', 'Fernanda RH Compliance', '333.444.555-66', '00305', 'fernanda.rh@rufato.com.br', '(11) 98888-3003', 'RH', '2022-05-20', 'active'),
('e4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'João da Silva', '444.555.666-77', '00452', 'joao.silva@rufato.com.br', '(11) 97777-4004', 'FUNCIONARIO', '2023-02-01', 'active'),
('e5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'Pedro Santos', '555.666.777-88', '00453', 'pedro.santos@rufato.com.br', '(11) 97777-5005', 'FUNCIONARIO', '2023-06-15', 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir POPs
INSERT INTO public.pops (id, company_id, department_id, code, title, author_id, responsible_name, classification, current_version, status, review_period_months, last_review_date, next_review_date) VALUES
('pop11111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'POP-PROD-001', 'Procedimento para Operação da Máquina de Corte CNC', 'e2222222-2222-2222-2222-222222222222', 'Roberto Líder', 'Segurança e Operação', '03', 'publicado', 12, '2026-08-15', '2027-08-15'),
('pop22222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'POP-PROD-002', 'Procedimento de Limpeza e Organização da Máquina', 'e2222222-2222-2222-2222-222222222222', 'Roberto Líder', 'Manutenção Autônoma', '02', 'publicado', 6, '2026-06-10', '2026-12-10'),
('pop33333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'POP-EXP-001', 'Procedimento de Embalagem e Expedição de Paletes', 'e1111111-1111-1111-1111-111111111111', 'Marcos Logística', 'Logística', '01', 'publicado', 12, '2026-01-10', '2027-01-10'),
('pop44444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'POP-ADM-001', 'Procedimento de Controle e Arquivo de Documentos', 'e1111111-1111-1111-1111-111111111111', 'Carlos Admin', 'Administrativo', '01', 'em_aprovacao', 12, NULL, '2027-08-01'),
('pop55555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'd8888888-8888-8888-8888-888888888888', 'POP-RH-001', 'Procedimento de Admissão e Integração de Funcionários', 'e3333333-3333-3333-3333-333333333333', 'Fernanda RH', 'Recrutamento & Seleção', '01', 'publicado', 12, '2026-03-01', '2027-03-01'),
('pop66666-6666-6666-6666-666666666666', 'c1111111-1111-1111-1111-111111111111', 'd6666666-6666-6666-6666-666666666666', 'POP-MAN-001', 'Abertura de Ordem de Serviço Preventiva', 'e1111111-1111-1111-1111-111111111111', 'André Manutenção', 'Manutenção', '02', 'publicado', 3, '2026-06-01', '2026-09-01'),
('pop77777-7777-7777-7777-777777777777', 'c1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'POP-LOG-001', 'Recebimento e Conferência de Matéria-Prima', 'e1111111-1111-1111-1111-111111111111', 'Marcos Logística', 'Recebimento', '01', 'publicado', 6, '2026-02-01', '2026-08-01'),
('pop88888-8888-8888-8888-888888888888', 'c1111111-1111-1111-1111-111111111111', 'd5555555-5555-5555-5555-555555555555', 'POP-ECO-001', 'Tratamento de Pedidos e Devoluções E-commerce', 'e1111111-1111-1111-1111-111111111111', 'Renata Digital', 'Atendimento', '01', 'rascunho', 12, NULL, '2027-09-01')
ON CONFLICT (id) DO NOTHING;
