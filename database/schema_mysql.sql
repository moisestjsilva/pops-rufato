-- =============================================================================
-- POP CONTROL (RUFATO MÓVEIS) - SCRIPT SQL COMPLETO PARA CLOUDPANEL (phpMyAdmin)
-- Compatível com: MySQL 8.0+ / MariaDB 10.6+
-- Codificação: UTF-8 (utf8mb4_unicode_ci)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Selecionar o banco de dados pops
CREATE DATABASE IF NOT EXISTS `pops` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pops`;

-- --------------------------------------------------------
-- 1. Tabela: companies (Empresas do Grupo Rufato)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` VARCHAR(64) NOT NULL,
  `corporate_name` VARCHAR(255) NOT NULL,
  `trade_name` VARCHAR(255) NOT NULL,
  `cnpj` VARCHAR(20) NOT NULL UNIQUE,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(2) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabela: departments (Setores da Indústria)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` VARCHAR(64) NOT NULL,
  `company_id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `manager_name` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dept_company` (`company_id`),
  CONSTRAINT `fk_dept_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabela: positions (Cargos Operacionais e Administrativos)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions` (
  `id` VARCHAR(64) NOT NULL,
  `company_id` VARCHAR(64) NOT NULL,
  `department_id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pos_company` (`company_id`),
  KEY `idx_pos_dept` (`department_id`),
  CONSTRAINT `fk_pos_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pos_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabela: employees (Colaboradores / Usuários do Sistema)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `company_id` VARCHAR(64) NOT NULL,
  `department_id` VARCHAR(64) NOT NULL,
  `position_id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(200) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL UNIQUE,
  `registration_number` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '123',
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'USUARIO', 'ADMINISTRADOR', 'GESTOR', 'RH', 'FUNCIONARIO') NOT NULL DEFAULT 'USUARIO',
  `account_status` ENUM('PENDENTE', 'APROVADO', 'BLOQUEADO') NOT NULL DEFAULT 'APROVADO',
  `managed_department_ids` TEXT DEFAULT NULL,
  `can_create_pop` TINYINT(1) NOT NULL DEFAULT 0,
  `can_edit_pop` TINYINT(1) NOT NULL DEFAULT 0,
  `admission_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_emp_company` (`company_id`),
  KEY `idx_emp_dept` (`department_id`),
  KEY `idx_emp_pos` (`position_id`),
  CONSTRAINT `fk_emp_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emp_pos` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabela: pops (Procedimentos Operacionais Padrão)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pops`;
CREATE TABLE `pops` (
  `id` VARCHAR(64) NOT NULL,
  `company_id` VARCHAR(64) NOT NULL,
  `department_id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `author_id` VARCHAR(64) DEFAULT NULL,
  `responsible_name` VARCHAR(150) NOT NULL,
  `classification` VARCHAR(100) DEFAULT 'Procedimento Operacional',
  `current_version` VARCHAR(20) DEFAULT '01',
  `status` ENUM('rascunho', 'em_revisao', 'em_aprovacao', 'aprovado', 'publicado', 'reprovado', 'obsoleto') NOT NULL DEFAULT 'rascunho',
  `review_period_months` INT NOT NULL DEFAULT 12,
  `last_review_date` DATE DEFAULT NULL,
  `next_review_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pop_company` (`company_id`),
  KEY `idx_pop_dept` (`department_id`),
  KEY `idx_pop_code` (`code`),
  CONSTRAINT `fk_pop_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pop_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabela: pop_versions (Versões e Conteúdo dos POPs)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pop_versions`;
CREATE TABLE `pop_versions` (
  `id` VARCHAR(64) NOT NULL,
  `pop_id` VARCHAR(64) NOT NULL,
  `version_number` VARCHAR(20) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `change_reason` TEXT DEFAULT NULL,
  `author_id` VARCHAR(64) DEFAULT NULL,
  `reviewer_id` VARCHAR(64) DEFAULT NULL,
  `approver_id` VARCHAR(64) DEFAULT NULL,
  `approval_date` TIMESTAMP NULL DEFAULT NULL,
  `published_date` TIMESTAMP NULL DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `status` ENUM('rascunho', 'em_revisao', 'em_aprovacao', 'aprovado', 'publicado', 'reprovado', 'obsoleto') NOT NULL DEFAULT 'rascunho',
  `document_hash` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ver_pop` (`pop_id`),
  CONSTRAINT `fk_ver_pop` FOREIGN KEY (`pop_id`) REFERENCES `pops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabela: pop_assignments (Atribuição de Obrigatoriedade)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pop_assignments`;
CREATE TABLE `pop_assignments` (
  `id` VARCHAR(64) NOT NULL,
  `pop_id` VARCHAR(64) NOT NULL,
  `department_id` VARCHAR(64) DEFAULT NULL,
  `position_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_asgn_pop` (`pop_id`),
  CONSTRAINT `fk_asgn_pop` FOREIGN KEY (`pop_id`) REFERENCES `pops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Tabela: acknowledgements (Ciências e Evidências de Leitura)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `acknowledgements`;
CREATE TABLE `acknowledgements` (
  `id` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `pop_id` VARCHAR(64) NOT NULL,
  `pop_version_id` VARCHAR(64) NOT NULL,
  `version_number` VARCHAR(20) NOT NULL,
  `acknowledged_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmation_type` ENUM('eletronica', 'assinatura_desenhada', 'govbr_simulado') NOT NULL DEFAULT 'eletronica',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `document_hash` VARCHAR(128) NOT NULL,
  `term_text` TEXT NOT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ack_emp` (`employee_id`),
  KEY `idx_ack_pop` (`pop_id`),
  CONSTRAINT `fk_ack_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ack_pop` FOREIGN KEY (`pop_id`) REFERENCES `pops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Tabela: signatures (Assinaturas Eletrônicas / Traçadas)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `signatures`;
CREATE TABLE `signatures` (
  `id` VARCHAR(64) NOT NULL,
  `acknowledgement_id` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `signature_data_url` LONGTEXT DEFAULT NULL,
  `transaction_id` VARCHAR(100) NOT NULL UNIQUE,
  `signature_type` VARCHAR(50) NOT NULL DEFAULT 'assinatura_eletronica_simples',
  `signed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sig_ack` (`acknowledgement_id`),
  KEY `idx_sig_emp` (`employee_id`),
  CONSTRAINT `fk_sig_ack` FOREIGN KEY (`acknowledgement_id`) REFERENCES `acknowledgements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sig_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Tabela: approvals (Fluxo de Validação e Aprovação)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `approvals`;
CREATE TABLE `approvals` (
  `id` VARCHAR(64) NOT NULL,
  `pop_version_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `status` ENUM('pendente', 'aprovado', 'reprovado') NOT NULL DEFAULT 'pendente',
  `comments` TEXT DEFAULT NULL,
  `decided_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_appr_ver` (`pop_version_id`),
  CONSTRAINT `fk_appr_ver` FOREIGN KEY (`pop_version_id`) REFERENCES `pop_versions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Tabela: audit_logs (Trilha Imutável de Auditoria)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_name` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `details` LONGTEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_name`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. Tabela: app_notifications (Notificações Internas)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `app_notifications`;
CREATE TABLE `app_notifications` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `read_status` TINYINT(1) NOT NULL DEFAULT 0,
  `link` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 13. Tabela: pop_change_logs (Histórico de Alterações do POP)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pop_change_logs`;
CREATE TABLE `pop_change_logs` (
  `id` VARCHAR(64) NOT NULL,
  `pop_id` VARCHAR(64) NOT NULL,
  `pop_version_id` VARCHAR(64) DEFAULT NULL,
  `version_number` VARCHAR(20) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `change_reason` TEXT NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cl_pop` (`pop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 14. Tabela: email_notification_logs (Disparo de E-mails)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `email_notification_logs`;
CREATE TABLE `email_notification_logs` (
  `id` VARCHAR(64) NOT NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `recipient_name` VARCHAR(150) NOT NULL,
  `recipient_role` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `pop_code` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('sent', 'failed', 'queued') NOT NULL DEFAULT 'sent',
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 15. DADOS INICIAIS (SEED) - RUFATO MÓVEIS
-- --------------------------------------------------------

-- Empresas
INSERT INTO `companies` (`id`, `corporate_name`, `trade_name`, `cnpj`, `city`, `state`, `status`) VALUES
('comp-1', 'Rufato Indústria e Comércio de Móveis Ltda', 'Rufato Móveis - Matriz Ubá', '19.823.456/0001-89', 'Ubá', 'MG', 'active'),
('comp-2', 'Rufato Logística e Distribuição Ltda', 'Rufato Logística - CD Central', '19.823.456/0002-60', 'Ubá', 'MG', 'active');

-- Setores
INSERT INTO `departments` (`id`, `company_id`, `code`, `name`, `manager_name`, `status`) VALUES
('dept-1', 'comp-1', 'PROD-USI', 'Usinagem & Corte', 'Carlos Alberto Silveira', 'active'),
('dept-2', 'comp-1', 'PROD-BOR', 'Borda & Furação CNC', 'Carlos Alberto Silveira', 'active'),
('dept-3', 'comp-1', 'PROD-PIN', 'Pintura UV & Acabamento', 'Renata Vasconcelos', 'active'),
('dept-4', 'comp-1', 'PROD-EMB', 'Embalagem & Expedição', 'João Paulo Meireles', 'active'),
('dept-5', 'comp-1', 'SST-NR', 'Segurança do Trabalho & Qualidade', 'Mariana Alencar', 'active'),
('dept-6', 'comp-1', 'RH-DP', 'Recursos Humanos', 'Patrícia Duarte', 'active');

-- Cargos
INSERT INTO `positions` (`id`, `company_id`, `department_id`, `code`, `title`, `description`, `status`) VALUES
('pos-1', 'comp-1', 'dept-1', 'OP-SEC-01', 'Operador de Seccionadora CNC', 'Responsável pelo corte de painéis MDF/MDP', 'active'),
('pos-2', 'comp-1', 'dept-1', 'AJ-PROD-01', 'Ajudante de Produção', 'Apoio na movimentação e abastecimento de chapas', 'active'),
('pos-3', 'comp-1', 'dept-2', 'OP-COL-01', 'Operador de Coladeira de Bordas', 'Aplicação de fita de borda PVC em componentes', 'active'),
('pos-4', 'comp-1', 'dept-3', 'OP-PIN-01', 'Operador de Linha de Pintura UV', 'Regulagem e aplicação de primer e verniz UV', 'active'),
('pos-5', 'comp-1', 'dept-4', 'CON-EXP-01', 'Conferente de Embalagem', 'Conferência de kits de ferragens e padrão de caixa', 'active'),
('pos-6', 'comp-1', 'dept-5', 'TEC-SEG-01', 'Técnico de Segurança do Trabalho', 'Inspeções de segurança NR-12 e auditoria de POPs', 'active');

-- Funcionários
INSERT INTO `employees` (`id`, `user_id`, `company_id`, `department_id`, `position_id`, `full_name`, `cpf`, `registration_number`, `email`, `phone`, `role`, `admission_date`, `status`) VALUES
('emp-101', 'usr-101', 'comp-1', 'dept-5', 'pos-6', 'Moisés Silva', '054.892.116-32', 'RUF-0145', 'moises.silva@rufato.com.br', '(32) 99841-2201', 'ADMINISTRADOR', '2021-03-15', 'active'),
('emp-102', 'usr-102', 'comp-1', 'dept-1', 'pos-1', 'Antônio Fagundes Ribeiro', '412.391.876-00', 'RUF-0312', 'antonio.ribeiro@rufato.com.br', '(32) 98877-1122', 'FUNCIONARIO', '2022-06-10', 'active'),
('emp-103', 'usr-103', 'comp-1', 'dept-2', 'pos-3', 'Luciana Martins Pereira', '789.123.456-78', 'RUF-0428', 'luciana.pereira@rufato.com.br', '(32) 99112-3344', 'FUNCIONARIO', '2023-01-20', 'active'),
('emp-104', 'usr-104', 'comp-1', 'dept-5', 'pos-6', 'Mariana Alencar', '332.901.442-15', 'RUF-0089', 'mariana.alencar@rufato.com.br', '(32) 99901-8822', 'GESTOR', '2019-08-01', 'active');

-- POP 101: Seccionadora CNC
INSERT INTO `pops` (`id`, `company_id`, `department_id`, `code`, `title`, `author_id`, `responsible_name`, `classification`, `current_version`, `status`, `review_period_months`, `last_review_date`, `next_review_date`) VALUES
('pop-101', 'comp-1', 'dept-1', 'POP-USI-001', 'Operação e Setup Seguro da Seccionadora Horizontal CNC', 'emp-101', 'Moisés Silva', 'Segurança & Operação (NR-12)', '03', 'publicado', 12, '2025-10-15', '2026-10-15');

-- Versão 03 do POP 101
INSERT INTO `pop_versions` (`id`, `pop_id`, `version_number`, `content`, `change_reason`, `author_id`, `reviewer_id`, `approver_id`, `approval_date`, `published_date`, `status`, `document_hash`) VALUES
('ver-101-3', 'pop-101', '03', '{"objective":"Padronizar a rotina de corte industrial de chapas de MDF/MDP na Seccionadora CNC Giben, garantindo precisão milimétrica e atendimento rigoroso aos requisitos da NR-12.","application":"Aplica-se a todos os operadores e ajudantes do setor de Usinagem da Rufato Móveis.","responsibilities":"Operador de Máquina: realizar o setup e alimentação das chapas. Líder de Produção: inspecionar o lote piloto. TST: verificar dispositivos de segurança.","materials":"EPIs obrigatórios: Protetor auricular tipo concha, óculos de segurança com proteção lateral, calçado com biqueira de composite. Instrumentos: Paquímetro digital 300mm.","risks_and_care":"Proibido operar com dispositivos de segurança ou barreira ótica desativados. Risco de corte e projeção de partículas. Uso proibido de luvas próximas à serra em movimento.","related_documents":"Manual do Fabricante Giben Matic; NR-12; Matriz de Riscos APR-USI-04.","steps":[{"id":"s1","step_number":"5.1","title":"Inspeção e Checklist de Segurança Pré-Operacional","description":"Verificar se o botão de parada de emergência está desobstruído. Testar a cortina de luz e o travamento da grade traseira.","warning":"Não ligar a máquina se qualquer sensor de intertravamento apresentar falha."},{"id":"s2","step_number":"5.2","title":"Carga do Plano de Corte e Ajuste das Pinças","description":"Carregar o arquivo de otimização de corte gerado pelo software de engenharia via rede ou pendrive oficial. Alinhar o esquadro das pinças pneumáticas com pressão de 6 bar."},{"id":"s3","step_number":"5.3","title":"Execução do Corte Piloto e Medição Dimensional","description":"Cortar o primeiro jogo de peças do lote. Utilizar paquímetro digital calibrado para conferir largura (+/- 0,2 mm) e esquadro através da medição de diagonais."}]}', 'Revisão periódica anual e inclusão de itens de inspeção da cortina óptica NR-12.', 'emp-101', 'emp-104', 'emp-104', '2025-10-14 14:00:00', '2025-10-15 08:00:00', 'publicado', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

-- Atribuição de obrigatoriedade
INSERT INTO `pop_assignments` (`id`, `pop_id`, `department_id`, `position_id`) VALUES
('asgn-101-1', 'pop-101', 'dept-1', 'pos-1'),
('asgn-101-2', 'pop-101', 'dept-1', 'pos-2');

-- Registro de Ciência / Assinatura
INSERT INTO `acknowledgements` (`id`, `employee_id`, `pop_id`, `pop_version_id`, `version_number`, `acknowledged_at`, `confirmation_type`, `ip_address`, `user_agent`, `document_hash`, `term_text`, `transaction_id`) VALUES
('ack-101', 'emp-102', 'pop-101', 'ver-101-3', '03', '2025-10-16 09:30:15', 'eletronica', '192.168.1.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Declaro que li, compreendi integralmente e fui treinado nos procedimentos do POP-USI-001 V03.', 'TX-RUF-2025-09124');

INSERT INTO `signatures` (`id`, `acknowledgement_id`, `employee_id`, `transaction_id`, `signature_type`, `signed_at`) VALUES
('sig-101', 'ack-101', 'emp-102', 'TX-RUF-2025-09124', 'assinatura_eletronica_simples', '2025-10-16 09:30:15');

SET FOREIGN_KEY_CHECKS = 1;
