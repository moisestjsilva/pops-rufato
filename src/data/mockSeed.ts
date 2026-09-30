import { 
  Company, 
  Department, 
  Position, 
  Employee, 
  POP, 
  POPVersion, 
  POPAssignment, 
  Acknowledgement, 
  SignatureRecord, 
  Approval, 
  AuditLog, 
  AppNotification,
  POPChangeLog,
  EmailNotificationLog
} from '../types';
import { PRESET_STEP_IMAGES } from '../utils/imageHelper';

export const initialCompanies: Company[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    corporate_name: 'Rufato Indústria e Comércio de Móveis Ltda',
    trade_name: 'Rufato Indústria de Móveis',
    cnpj: '12.345.678/0001-99',
    status: 'active',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  }
];

export const initialDepartments: Department[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'Produção',
    manager_name: 'Roberto Líder',
    status: 'active',
    created_at: '2025-01-11T09:00:00Z',
    updated_at: '2025-01-11T09:00:00Z'
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'Expedição',
    manager_name: 'Marcos Logística',
    status: 'active',
    created_at: '2025-01-11T09:15:00Z',
    updated_at: '2025-01-11T09:15:00Z'
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'Administrativo',
    manager_name: 'Carlos Admin',
    status: 'active',
    created_at: '2025-01-11T09:30:00Z',
    updated_at: '2025-01-11T09:30:00Z'
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'Comercial',
    manager_name: 'Juliana Vendas',
    status: 'active',
    created_at: '2025-01-11T09:45:00Z',
    updated_at: '2025-01-11T09:45:00Z'
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'E-commerce',
    manager_name: 'Renata Digital',
    status: 'active',
    created_at: '2025-01-11T10:00:00Z',
    updated_at: '2025-01-11T10:00:00Z'
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'Manutenção',
    manager_name: 'André Manutenção',
    status: 'active',
    created_at: '2025-01-11T10:15:00Z',
    updated_at: '2025-01-11T10:15:00Z'
  },
  {
    id: 'd7777777-7777-7777-7777-777777777777',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'PCP',
    manager_name: 'Luciana Planejamento',
    status: 'active',
    created_at: '2025-01-11T10:30:00Z',
    updated_at: '2025-01-11T10:30:00Z'
  },
  {
    id: 'd8888888-8888-8888-8888-888888888888',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    name: 'RH',
    manager_name: 'Fernanda RH',
    status: 'active',
    created_at: '2025-01-11T10:45:00Z',
    updated_at: '2025-01-11T10:45:00Z'
  }
];

export const initialPositions: Position[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Produção',
    title: 'Operador de Máquina de Corte',
    status: 'active',
    created_at: '2025-01-12T08:00:00Z',
    updated_at: '2025-01-12T08:00:00Z'
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Produção',
    title: 'Auxiliar de Produção',
    status: 'active',
    created_at: '2025-01-12T08:15:00Z',
    updated_at: '2025-01-12T08:15:00Z'
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Produção',
    title: 'Líder de Produção',
    status: 'active',
    created_at: '2025-01-12T08:30:00Z',
    updated_at: '2025-01-12T08:30:00Z'
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Expedição',
    title: 'Auxiliar de Expedição',
    status: 'active',
    created_at: '2025-01-12T08:45:00Z',
    updated_at: '2025-01-12T08:45:00Z'
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Administrativo',
    title: 'Gerente Administrativo',
    status: 'active',
    created_at: '2025-01-12T09:00:00Z',
    updated_at: '2025-01-12T09:00:00Z'
  },
  {
    id: 'p6666666-6666-6666-6666-666666666666',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd8888888-8888-8888-8888-888888888888',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'RH',
    title: 'Analista de RH & Compliance',
    status: 'active',
    created_at: '2025-01-12T09:15:00Z',
    updated_at: '2025-01-12T09:15:00Z'
  }
];

export const initialEmployees: Employee[] = [
  // SUPER ADMIN (Moisés Silva - Administrador Global Supremo)
  {
    id: 'emp-moises-globaladmin',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    position_id: 'p5555555-5555-5555-5555-555555555555',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Administrativo',
    position_title: 'Super Administrador Global',
    full_name: 'Moisés Silva',
    cpf: '054.892.116-32',
    registration_number: 'RUF-0001',
    email: 'moisestj86@gmail.com',
    phone: '(32) 99841-2201',
    password: '123',
    role: 'SUPER_ADMIN',
    account_status: 'APROVADO',
    can_create_pop: true,
    can_edit_pop: true,
    admission_date: '2020-01-01',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export const initialPOPs: POP[] = [
  {
    id: 'pop11111-1111-1111-1111-111111111111',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Produção',
    code: 'POP-PROD-001',
    title: 'Procedimento para Operação da Máquina de Corte CNC',
    author_id: 'e2222222-2222-2222-2222-222222222222',
    author_name: 'Roberto Líder de Produção',
    responsible_name: 'Roberto Líder',
    classification: 'Segurança e Operação',
    current_version: '03',
    status: 'publicado',
    review_period_months: 12,
    last_review_date: '2026-08-15',
    next_review_date: '2027-08-15',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-08-15T14:30:00Z',
    assigned_department_ids: ['d1111111-1111-1111-1111-111111111111'],
    assigned_position_ids: ['p1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'p3333333-3333-3333-3333-333333333333'],
    versions: [
      {
        id: 'v1111111-1111-1111-1111-111111111111',
        pop_id: 'pop11111-1111-1111-1111-111111111111',
        version_number: '01',
        change_reason: 'Elaboração inicial do procedimento padrão de corte.',
        author_id: 'e2222222-2222-2222-2222-222222222222',
        author_name: 'Roberto Líder de Produção',
        reviewer_id: 'e3333333-3333-3333-3333-333333333333',
        reviewer_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-01-12T15:00:00Z',
        published_date: '2026-01-15T09:00:00Z',
        status: 'obsoleto',
        document_hash: 'A1F39E882C74D902',
        created_at: '2026-01-10T10:00:00Z',
        content: {
          objective: 'Padronizar a operação básica da máquina de corte CNC.',
          application: 'Aplicável a todos os operadores do setor de Produção.',
          responsibilities: 'Operador de Corte: Execução. Líder de Produção: Supervisão.',
          materials: 'Chapas MDF, Óculos de Proteção, Protetor Auricular, Luvas anticorte.',
          steps: [
            { id: 'st1', step_number: '5.1', title: 'Verificação de EPIs', description: 'Garantir uso de óculos e abafador antes de ligar o painel.' },
            { id: 'st2', step_number: '5.2', title: 'Alimentação do Programa', description: 'Carregar o arquivo de corte via pendrive ou rede.' }
          ],
          risks_and_care: 'Risco de aprisionamento de membros e projeção de cavacos.',
          related_documents: 'Manual do Fabricante CNC Modelo X-500, NR-12.',
          history_notes: 'Criação inicial da documentação.'
        }
      },
      {
        id: 'v2222222-2222-2222-2222-222222222222',
        pop_id: 'pop11111-1111-1111-1111-111111111111',
        version_number: '02',
        change_reason: 'Inclusão da rotina obrigatoria de calibração a laser.',
        author_id: 'e2222222-2222-2222-2222-222222222222',
        author_name: 'Roberto Líder de Produção',
        reviewer_id: 'e3333333-3333-3333-3333-333333333333',
        reviewer_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-04-18T10:00:00Z',
        published_date: '2026-04-20T08:30:00Z',
        status: 'obsoleto',
        document_hash: 'B47C1019F83A2990',
        created_at: '2026-04-16T14:00:00Z',
        content: {
          objective: 'Estabelecer os critérios de segurança e rotinas de operação da Seccionadora CNC.',
          application: 'Operadores de Máquina de Corte e Auxiliares no setor de Produção.',
          responsibilities: 'Operadores: Operar e calibrar. Líder: Validar primeira peça de teste.',
          materials: 'EPIs completos, paquímetro digital, calibrador a laser.',
          steps: [
            { id: 'st1', step_number: '5.1', title: 'Checklist de Segurança', description: 'Verificar botões de emergência e cortinas de luz.' },
            { id: 'st2', step_number: '5.2', title: 'Calibração do Esquadro', description: 'Executar ciclo automatizado de zeramento dos eixos X e Y.' }
          ],
          risks_and_care: 'Cuidado com projeção de partículas soltas e corte de lâmina exposta.',
          related_documents: 'NR-12, FISPQ de Lubrificantes.',
          history_notes: 'Adicionada obrigatoriedade de medição com paquímetro.'
        }
      },
      {
        id: 'v3333333-3333-3333-3333-333333333333',
        pop_id: 'pop11111-1111-1111-1111-111111111111',
        version_number: '03',
        change_reason: 'Atualização de segurança NR-12, inclusão de bloqueio de energia LOTO e protocolo de travamento.',
        author_id: 'e2222222-2222-2222-2222-222222222222',
        author_name: 'Roberto Líder de Produção',
        reviewer_id: 'e3333333-3333-3333-3333-333333333333',
        reviewer_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-08-15T11:20:00Z',
        published_date: '2026-08-15T14:30:00Z',
        status: 'publicado',
        document_hash: 'F982C551A009DE77',
        created_at: '2026-08-10T09:00:00Z',
        content: {
          objective: 'Estabelecer o procedimento operacional padrão para setup, operação segura e parada de emergência da Seccionadora CNC de placas de MDF/MDP na Rufato Indústria de Móveis.',
          application: 'Este procedimento aplica-se obrigatoriamente a todos os Operadores de Corte, Auxiliares de Produção e Líderes de Setor atuantes na unidade industrial.',
          responsibilities: 'Operador de Máquina: Executar o checklist diário, alimentar o plano de corte e operar o equipamento conforme NR-12. Líder de Produção: Fiscalizar o uso de EPIs e autorizar o início do lote.',
          materials: 'EPIs Obrigatórios (Protetor aurícula tipo concha, Óculos de segurança ampla visão, Calçado de segurança com biqueira de aço, Luva anticorte Nível 5 para manuseio de MDF). Equipamentos de medição: Paquímetro digital calibrado.',
          steps: [
            { 
              id: 's1', 
              step_number: '5.1', 
              title: 'Inspeção Inicial e Ativação de Segurança', 
              description: 'Realizar varredura visual no percurso do carro da serra. Testar o acionamento do cabo de parada de emergência e barreira fotoelétrica frontais.', 
              warning: 'Nunca opere a máquina com intertravamento solto ou desativado.',
              image_url: PRESET_STEP_IMAGES[0].dataUrl,
              image_caption: PRESET_STEP_IMAGES[0].caption
            },
            { 
              id: 's2', 
              step_number: '5.2', 
              title: 'Carregamento do Programa de Corte', 
              description: 'Importar o arquivo de ordenamento (.PCP) gerado pelo sistema de otimização de plano de corte. Conferir espessura e código da chapa.' 
            },
            { 
              id: 's3', 
              step_number: '5.3', 
              title: 'Corte da Primeira Peça Piloto', 
              description: 'Efetuar o primeiro corte em velocidade reduzida (50%). Medir as dimensões e o esquadro com paquímetro digital antes da produção seriada.',
              image_url: PRESET_STEP_IMAGES[1].dataUrl,
              image_caption: PRESET_STEP_IMAGES[1].caption
            },
            { 
              id: 's4', 
              step_number: '5.4', 
              title: 'Etiquetagem e Paletização', 
              description: 'Fixar a etiqueta de código de barras em cada peça cortada e dispor sobre palete padronizado respeitando a pilha máxima de 1,20m.',
              image_url: PRESET_STEP_IMAGES[2].dataUrl,
              image_caption: PRESET_STEP_IMAGES[2].caption
            }
          ],
          risks_and_care: 'Corte de membros superiores, ruído excessivo, projeção de estilhaços. Em caso de ruído atípico, acione o botão de emergência imediatamente.',
          related_documents: 'NR-12 (Segurança no Trabalho em Máquinas e Equipamentos), OS-PROD-012 (Ordem de Serviço de Segurança do Trabalho).',
          history_notes: 'Revisão geral para adequação à auditoria de Compliance NR-12 2026.'
        }
      }
    ]
  },
  {
    id: 'pop22222-2222-2222-2222-222222222222',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Produção',
    code: 'POP-PROD-002',
    title: 'Procedimento de Limpeza e Organização da Máquina',
    author_id: 'e2222222-2222-2222-2222-222222222222',
    author_name: 'Roberto Líder de Produção',
    responsible_name: 'Roberto Líder',
    classification: 'Manutenção Autônoma',
    current_version: '02',
    status: 'publicado',
    review_period_months: 6,
    last_review_date: '2026-06-10',
    next_review_date: '2026-12-10',
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-06-10T16:00:00Z',
    assigned_department_ids: ['d1111111-1111-1111-1111-111111111111'],
    assigned_position_ids: ['p1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222'],
    versions: [
      {
        id: 'v2222222-2222-2222-2222-222222222223',
        pop_id: 'pop22222-2222-2222-2222-222222222222',
        version_number: '02',
        change_reason: 'Adequação dos produtos de limpeza biodegradáveis.',
        author_id: 'e2222222-2222-2222-2222-222222222222',
        author_name: 'Roberto Líder de Produção',
        reviewer_id: 'e3333333-3333-3333-3333-333333333333',
        reviewer_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-06-08T10:00:00Z',
        published_date: '2026-06-10T16:00:00Z',
        status: 'publicado',
        document_hash: 'C333A1900F8A3311',
        created_at: '2026-06-05T09:00:00Z',
        content: {
          objective: 'Garantir a limpeza diária, remoção de serragem e organização 5S das máquinas de corte.',
          application: 'Todos os operadores e auxiliares de produção no encerramento de cada turno.',
          responsibilities: 'Equipe do Turno: Limpeza. Líder de Produção: Inspeção visual de liberação.',
          materials: 'Aspirador industrial para marcenaria, pincel macio, desengraxante biodegradável, pano limpo.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Desligamento e Bloqueio Elétrico', description: 'Desligar a chave geral no painel lateral e colocar o cadeado de bloqueio.' },
            { id: 's2', step_number: '5.2', title: 'Aspiração da Serragem', description: 'Aspirar os dutos de exaustão e trilhos do guiamento linear.' }
          ],
          risks_and_care: 'Não utilizar ar comprimido para limpeza de serragem acumulada no corpo.',
          related_documents: 'Programa 5S Rufato Móveis, Diretrizes de Sustentabilidade.',
          history_notes: 'Proibição do uso de ar comprimido direto para evitar nuvem de poeira combustivel.'
        }
      }
    ]
  },
  {
    id: 'pop33333-3333-3333-3333-333333333333',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Expedição',
    code: 'POP-EXP-001',
    title: 'Procedimento de Embalagem e Expedição de Paletes',
    author_id: 'e1111111-1111-1111-1111-111111111111',
    author_name: 'Carlos Eduardo Admin',
    responsible_name: 'Marcos Logística',
    classification: 'Logística',
    current_version: '01',
    status: 'publicado',
    review_period_months: 12,
    last_review_date: '2026-01-10',
    next_review_date: '2027-01-10',
    created_at: '2026-01-10T11:00:00Z',
    updated_at: '2026-01-10T11:00:00Z',
    assigned_department_ids: ['d2222222-2222-2222-2222-222222222222'],
    assigned_position_ids: ['p4444444-4444-4444-4444-444444444444'],
    versions: [
      {
        id: 'v3333333-3333-3333-3333-333333333334',
        pop_id: 'pop33333-3333-3333-3333-333333333333',
        version_number: '01',
        change_reason: 'Padronização da rotulagem de expedição.',
        author_id: 'e1111111-1111-1111-1111-111111111111',
        author_name: 'Carlos Eduardo Admin',
        reviewer_id: 'e3333333-3333-3333-3333-333333333333',
        reviewer_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-01-10T10:00:00Z',
        published_date: '2026-01-10T11:00:00Z',
        status: 'publicado',
        document_hash: 'E88812300AFB9110',
        created_at: '2026-01-10T11:00:00Z',
        content: {
          objective: 'Descrever a metodologia correta de proteção, plastificação Stretch e empilhamento de móveis desmontados.',
          application: 'Equipe de conferência e embalagem na Expedição.',
          responsibilities: 'Conferente: Checagem da nota fiscal e volumes. Embalador: Envolvelmento Stretch.',
          materials: 'Filme Stretch 500mm, cantoneiras de papelão reciclado, fita adesiva de segurança, impressora de etiquetas.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Conferência de Notas Fiscais', description: 'Conferir código do pedido e quantidade de volumes no coletor de dados.' },
            { id: 's2', step_number: '5.2', title: 'Aplicação de Cantoneiras', description: 'Proteger os 4 cantos dos volumes com papelão prensado antes da filmagem.' }
          ],
          risks_and_care: 'Tombamento de cargas na paletização. Respeitar o limite de 1.2m de altura.',
          related_documents: 'Manual de Qualidade Logística 2026.',
          history_notes: 'Documento original.'
        }
      }
    ]
  },
  {
    id: 'pop44444-4444-4444-4444-444444444444',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Administrativo',
    code: 'POP-ADM-001',
    title: 'Procedimento de Controle e Arquivo de Documentos de Compliance',
    author_id: 'e1111111-1111-1111-1111-111111111111',
    author_name: 'Carlos Eduardo Admin',
    responsible_name: 'Carlos Admin',
    classification: 'Administrativo',
    current_version: '01',
    status: 'em_aprovacao',
    review_period_months: 12,
    next_review_date: '2027-08-01',
    created_at: '2026-08-01T14:00:00Z',
    updated_at: '2026-08-01T14:00:00Z',
    assigned_department_ids: ['d3333333-3333-3333-3333-333333333333', 'd8888888-8888-8888-8888-888888888888'],
    assigned_position_ids: ['p5555555-5555-5555-5555-555555555555', 'p6666666-6666-6666-6666-666666666666'],
    versions: [
      {
        id: 'v4444444-4444-4444-4444-444444444445',
        pop_id: 'pop44444-4444-4444-4444-444444444444',
        version_number: '01',
        change_reason: 'Elaboração do procedimento para conformidade com a LGPD e rastreabilidade documental.',
        author_id: 'e1111111-1111-1111-1111-111111111111',
        author_name: 'Carlos Eduardo Admin',
        status: 'em_aprovacao',
        document_hash: 'D44481900FFA2200',
        created_at: '2026-08-01T14:00:00Z',
        content: {
          objective: 'Definir regras para armazenamento seguro e temporalidade dos registros físicos e digitais.',
          application: 'Setores Administrativos, Recursos Humanos e Controladoria.',
          responsibilities: 'Gestor Administrativo: Aprovar temporalidade. Analistas: Indexação.',
          materials: 'Sistema POP Control, Nuvem Supabase Encriptada, Arquivo Deslizante.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Digitalização de Contratos', description: 'Toda folha física deve ser escaneada em 300dpi e subida no GED.' },
            { id: 's2', step_number: '5.2', title: 'Assinatura e Validação Digital', description: 'Aplicar a trilha de evidências com IP e timestamp antes da conclusão.' }
          ],
          risks_and_care: 'Vazamento de dados pessoais (LGPD). Manter permissões restritas.',
          related_documents: 'Política Interna de Segurança da Informação, LGPD Lei 13.709.',
          history_notes: 'Versão em análise pela diretoria.'
        }
      }
    ]
  },
  {
    id: 'pop55555-5555-5555-5555-555555555555',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd8888888-8888-8888-8888-888888888888',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'RH',
    code: 'POP-RH-001',
    title: 'Procedimento de Admissão e Integração de Funcionários',
    author_id: 'e3333333-3333-3333-3333-333333333333',
    author_name: 'Fernanda RH Compliance',
    responsible_name: 'Fernanda RH',
    classification: 'Recrutamento & Seleção',
    current_version: '01',
    status: 'publicado',
    review_period_months: 12,
    last_review_date: '2026-03-01',
    next_review_date: '2027-03-01',
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
    assigned_department_ids: ['d8888888-8888-8888-8888-888888888888'],
    assigned_position_ids: ['p6666666-6666-6666-6666-666666666666'],
    versions: [
      {
        id: 'v5555555-5555-5555-5555-555555555556',
        pop_id: 'pop55555-5555-5555-5555-555555555555',
        version_number: '01',
        change_reason: 'Inclusão da atribuição automática de POPs no momento do cadastro no sistema.',
        author_id: 'e3333333-3333-3333-3333-333333333333',
        author_name: 'Fernanda RH Compliance',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-03-01T08:30:00Z',
        published_date: '2026-03-01T09:00:00Z',
        status: 'publicado',
        document_hash: 'F555998811CC3344',
        created_at: '2026-03-01T09:00:00Z',
        content: {
          objective: 'Nortear o onboarding de novos colaboradores, cadastro no sistema POP Control e envio do kit de integração.',
          application: 'Equipe de Recursos Humanos e Gestores de Área.',
          responsibilities: 'Analista de RH: Cadastrar funcionário e disparar ciências obrigatórias.',
          materials: 'Formulários admissionais, e-Social, Plataforma POP Control.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Cadastro e Vinculação de Cargo', description: 'Cadastrar o funcionário informando Empresa, Setor e Cargo no sistema.' },
            { id: 's2', step_number: '5.2', title: 'Orientação de Acesso', description: 'Entregar a senha inicial e guiar o colaborador na primeira assinatura de ciência dos POPs do cargo.' }
          ],
          risks_and_care: 'Iniciar atividades operacionais sem a ciência comprovada dos procedimentos de segurança.',
          related_documents: 'Manual do Colaborador, Código de Conduta Ética.',
          history_notes: 'Publicação oficial do fluxo de onboarding digital.'
        }
      }
    ]
  },
  {
    id: 'pop66666-6666-6666-6666-666666666666',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd6666666-6666-6666-6666-666666666666',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Manutenção',
    code: 'POP-MAN-001',
    title: 'Abertura de Ordem de Serviço Preventiva e Corretiva',
    author_id: 'e1111111-1111-1111-1111-111111111111',
    author_name: 'Carlos Eduardo Admin',
    responsible_name: 'André Manutenção',
    classification: 'Manutenção',
    current_version: '02',
    status: 'publicado',
    review_period_months: 3,
    last_review_date: '2026-06-01',
    next_review_date: '2026-09-01', // Próximo do vencimento!
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    assigned_department_ids: ['d6666666-6666-6666-6666-666666666666', 'd1111111-1111-1111-1111-111111111111'],
    assigned_position_ids: ['p1111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333'],
    versions: [
      {
        id: 'v6666666-6666-6666-6666-666666666667',
        pop_id: 'pop66666-6666-6666-6666-666666666666',
        version_number: '02',
        change_reason: 'Ajuste no prazo de atendimento de OS de emergência.',
        author_id: 'e1111111-1111-1111-1111-111111111111',
        author_name: 'Carlos Eduardo Admin',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-06-01T09:00:00Z',
        published_date: '2026-06-01T10:00:00Z',
        status: 'publicado',
        document_hash: 'A666112233445566',
        created_at: '2026-06-01T10:00:00Z',
        content: {
          objective: 'Padronizar a solicitação e atendimento de manutenção mecânica e elétrica na fábrica.',
          application: 'Equipe de Manutenção Industrial e Líderes de Produção.',
          responsibilities: 'Solicitante: Detalhar a falha. Técnico: Executar reparo e registrar causa raiz.',
          materials: 'Ferramentas manuais aisladas, Multímetro, Luvas isolantes de alta tensão.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Abertura no Totem', description: 'Registrar o número do ativo e sintoma de falha no sistema.' },
            { id: 's2', step_number: '5.2', title: 'Bloqueio LOTO', description: 'Instalar cartão e travamento físico na alimentação elétrica da máquina.' }
          ],
          risks_and_care: 'Choque elétrico, acionamento indevido. Bloqueio obrigatório.',
          related_documents: 'NR-10, NR-12.',
          history_notes: 'Revisão trimestral ordinária.'
        }
      }
    ]
  },
  {
    id: 'pop77777-7777-7777-7777-777777777777',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'Expedição',
    code: 'POP-LOG-001',
    title: 'Recebimento e Conferência de Matéria-Prima em Doca',
    author_id: 'e1111111-1111-1111-1111-111111111111',
    author_name: 'Carlos Eduardo Admin',
    responsible_name: 'Marcos Logística',
    classification: 'Recebimento',
    current_version: '01',
    status: 'publicado',
    review_period_months: 6,
    last_review_date: '2026-02-01',
    next_review_date: '2026-08-01', // Vencido!
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-01T08:00:00Z',
    assigned_department_ids: ['d2222222-2222-2222-2222-222222222222'],
    assigned_position_ids: ['p4444444-4444-4444-4444-444444444444'],
    versions: [
      {
        id: 'v7777777-7777-7777-7777-777777777778',
        pop_id: 'pop77777-7777-7777-7777-777777777777',
        version_number: '01',
        change_reason: 'Definição de checklist para recebimento de MDF e cola de borda.',
        author_id: 'e1111111-1111-1111-1111-111111111111',
        author_name: 'Carlos Eduardo Admin',
        approver_id: 'e1111111-1111-1111-1111-111111111111',
        approver_name: 'Carlos Eduardo Admin',
        approval_date: '2026-02-01T07:30:00Z',
        published_date: '2026-02-01T08:00:00Z',
        status: 'publicado',
        document_hash: 'A777990088112233',
        created_at: '2026-02-01T08:00:00Z',
        content: {
          objective: 'Inspecionar a qualidade físico-química da matéria-prima descarregada nas docas.',
          application: 'Recebedores e Conferentes de Carga.',
          responsibilities: 'Conferente: Inspecionar umidade e avarias. Almoxarife: Dar entrada no ERP.',
          materials: 'Higrômetro de madeira, Fita métrica, Coletor de dados sem fio.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Checagem de Lacres', description: 'Verificar se o lacre do caminhão confere com a DANFE.' },
            { id: 's2', step_number: '5.2', title: 'Medição de Umidade', description: 'Medir a umidade de 5 chapas por lote. Se > 12%, rejeitar o carregamento.' }
          ],
          risks_and_care: 'Queda de materiais pesados durante descarregamento com empilhadeira.',
          related_documents: 'Manual de Especificação Técnica de Fornecedores.',
          history_notes: 'Documento necessita de revisão urgente devido ao término do prazo de 6 meses.'
        }
      }
    ]
  },
  {
    id: 'pop88888-8888-8888-8888-888888888888',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    department_id: 'd5555555-5555-5555-5555-555555555555',
    company_name: 'Rufato Indústria de Móveis',
    department_name: 'E-commerce',
    code: 'POP-ECO-001',
    title: 'Tratamento e Separação de Pedidos do E-commerce',
    author_id: 'e1111111-1111-1111-1111-111111111111',
    author_name: 'Carlos Eduardo Admin',
    responsible_name: 'Renata Digital',
    classification: 'Atendimento',
    current_version: '01',
    status: 'rascunho',
    review_period_months: 12,
    next_review_date: '2027-09-01',
    created_at: '2026-08-20T11:00:00Z',
    updated_at: '2026-08-20T11:00:00Z',
    assigned_department_ids: ['d5555555-5555-5555-5555-555555555555'],
    assigned_position_ids: [],
    versions: [
      {
        id: 'v8888888-8888-8888-8888-888888888889',
        pop_id: 'pop88888-8888-8888-8888-888888888888',
        version_number: '01',
        change_reason: 'Rascunho do novo procedimento de vendas diretas B2C.',
        author_id: 'e1111111-1111-1111-1111-111111111111',
        author_name: 'Carlos Eduardo Admin',
        status: 'rascunho',
        document_hash: 'A888112233445577',
        created_at: '2026-08-20T11:00:00Z',
        content: {
          objective: 'Regulamentar a triagem automática dos pedidos vindos do Marketplace.',
          application: 'Equipe do E-commerce Rufato.',
          responsibilities: 'Analista de E-commerce: Faturamento e liberação.',
          materials: 'Computador, Leitor de código de barras.',
          steps: [
            { id: 's1', step_number: '5.1', title: 'Triagem de Pagamento', description: 'Verificar status aprovado no intermediador de pagamento.' }
          ],
          risks_and_care: 'Envio de produto incorreto para o cliente final.',
          related_documents: 'Código de Defesa do Consumidor.',
          history_notes: 'Em fase de redação preliminar.'
        }
      }
    ]
  }
];

export const initialAcknowledgements: Acknowledgement[] = [
  {
    id: 'ack11111-1111-1111-1111-111111111111',
    employee_id: 'e4444444-4444-4444-4444-444444444444',
    employee_name: 'João da Silva',
    employee_cpf: '444.555.666-77',
    employee_registration: '00452',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_code: 'POP-PROD-001',
    pop_title: 'Procedimento para Operação da Máquina de Corte CNC',
    pop_version_id: 'v3333333-3333-3333-3333-333333333333',
    version_number: '03',
    acknowledged_at: '2026-08-16T14:32:00Z',
    confirmation_type: 'assinatura_desenhada',
    ip_address: '189.120.45.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
    document_hash: 'F982C551A009DE77',
    term_text: 'Declaro que li, compreendi e estou ciente deste procedimento, comprometendo-me a seguir as orientações nele estabelecidas.',
    signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 50 10, 90 40 T 170 30" stroke="%231E3A8A" stroke-width="3" fill="none"/></svg>',
    transaction_id: 'TX-20260816-00452-F982'
  },
  {
    id: 'ack22222-2222-2222-2222-222222222222',
    employee_id: 'e2222222-2222-2222-2222-222222222222',
    employee_name: 'Roberto Líder de Produção',
    employee_cpf: '222.333.444-55',
    employee_registration: '00204',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_code: 'POP-PROD-001',
    pop_title: 'Procedimento para Operação da Máquina de Corte CNC',
    pop_version_id: 'v3333333-3333-3333-3333-333333333333',
    version_number: '03',
    acknowledged_at: '2026-08-15T15:00:00Z',
    confirmation_type: 'eletronica',
    ip_address: '189.120.45.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    document_hash: 'F982C551A009DE77',
    term_text: 'Declaro que li, compreendi e estou ciente deste procedimento, comprometendo-me a seguir as orientações nele estabelecidas.',
    transaction_id: 'TX-20260815-00204-F982'
  },
  {
    id: 'ack33333-3333-3333-3333-333333333333',
    employee_id: 'e4444444-4444-4444-4444-444444444444',
    employee_name: 'João da Silva',
    employee_cpf: '444.555.666-77',
    employee_registration: '00452',
    pop_id: 'pop22222-2222-2222-2222-222222222222',
    pop_code: 'POP-PROD-002',
    pop_title: 'Procedimento de Limpeza e Organização da Máquina',
    pop_version_id: 'v2222222-2222-2222-2222-222222222223',
    version_number: '02',
    acknowledged_at: '2026-06-11T09:15:00Z',
    confirmation_type: 'eletronica',
    ip_address: '189.120.45.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    document_hash: 'C333A1900F8A3311',
    term_text: 'Declaro que li, compreendi e estou ciente deste procedimento, comprometendo-me a seguir as orientações nele estabelecidas.',
    transaction_id: 'TX-20260611-00452-C333'
  }
];

export const initialSignatures: SignatureRecord[] = [
  {
    id: 'sig11111-1111-1111-1111-111111111111',
    acknowledgement_id: 'ack11111-1111-1111-1111-111111111111',
    employee_id: 'e4444444-4444-4444-4444-444444444444',
    employee_name: 'João da Silva',
    document_code: 'POP-PROD-001',
    document_version: '03',
    signature_data_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 50 10, 90 40 T 170 30" stroke="%231E3A8A" stroke-width="3" fill="none"/></svg>',
    transaction_id: 'TX-20260816-00452-F982',
    signature_type: 'assinatura_desenhada',
    signed_at: '2026-08-16T14:32:00Z'
  }
];

export const initialApprovals: Approval[] = [
  {
    id: 'app11111-1111-1111-1111-111111111111',
    pop_version_id: 'v3333333-3333-3333-3333-333333333333',
    pop_code: 'POP-PROD-001',
    pop_title: 'Procedimento para Operação da Máquina de Corte CNC',
    version_number: '03',
    user_id: 'e1111111-1111-1111-1111-111111111111',
    user_name: 'Carlos Eduardo Admin',
    user_role: 'ADMINISTRADOR',
    action: 'aprovado',
    comments: 'Aprovado conforme adequação às exigências da auditoria NR-12 2026.',
    created_at: '2026-08-15T11:20:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log11111-1111-1111-1111-111111111111',
    user_name: 'Carlos Eduardo Admin',
    user_email: 'carlos.admin@rufato.com.br',
    user_role: 'ADMINISTRADOR',
    action: 'PUBLICAÇÃO',
    entity_name: 'POP',
    entity_id: 'POP-PROD-001',
    details: 'Publicada a Versão 03 do procedimento POP-PROD-001. A versão 02 foi marcada automaticamente como Obsoleta.',
    ip_address: '189.120.45.100',
    created_at: '2026-08-15T14:30:00Z'
  },
  {
    id: 'log22222-2222-2222-2222-222222222222',
    user_name: 'João da Silva',
    user_email: 'joao.silva@rufato.com.br',
    user_role: 'FUNCIONARIO',
    action: 'CIÊNCIA & ASSINATURA',
    entity_name: 'ACKNOWLEDGEMENT',
    entity_id: 'POP-PROD-001 (v03)',
    details: 'Confirmada ciência e assinatura eletrônica simples do POP-PROD-001 v03 pelo funcionário João da Silva (Matrícula 00452). Hash: F982C551A009DE77.',
    ip_address: '189.120.45.102',
    created_at: '2026-08-16T14:32:00Z'
  },
  {
    id: 'log33333-3333-3333-3333-333333333333',
    user_name: 'Fernanda RH Compliance',
    user_email: 'fernanda.rh@rufato.com.br',
    user_role: 'RH',
    action: 'CADASTRO FUNCIONÁRIO',
    entity_name: 'EMPLOYEE',
    entity_id: 'Pedro Santos',
    details: 'Cadastrado novo funcionário Pedro Santos (Matrícula 00453) no setor de Produção. POPs obrigatórios atribuídos automaticamente.',
    ip_address: '189.120.45.105',
    created_at: '2026-01-14T09:30:00Z'
  }
];

export const initialChangeLogs: POPChangeLog[] = [
  {
    id: 'chg11111-1111-1111-1111-111111111111',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_version_id: 'v1111111-1111-1111-1111-111111111111',
    version_number: '01',
    user_id: 'e2222222-2222-2222-2222-222222222222',
    user_name: 'Roberto Líder de Produção',
    user_role: 'GESTOR',
    action: 'Criação de Rascunho',
    change_reason: 'Elaboração inicial do procedimento operacional padrão de corte CNC.',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'chg22222-2222-2222-2222-222222222222',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_version_id: 'v1111111-1111-1111-1111-111111111111',
    version_number: '01',
    user_id: 'e1111111-1111-1111-1111-111111111111',
    user_name: 'Carlos Eduardo Admin',
    user_role: 'ADMINISTRADOR',
    action: 'Aprovação e Publicação',
    change_reason: 'Aprovada a versão 01 inicial para implementação no setor.',
    created_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 'chg33333-3333-3333-3333-333333333333',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_version_id: 'v2222222-2222-2222-2222-222222222222',
    version_number: '02',
    user_id: 'e2222222-2222-2222-2222-222222222222',
    user_name: 'Roberto Líder de Produção',
    user_role: 'GESTOR',
    action: 'Nova Versão Criada',
    change_reason: 'Inclusão da rotina obrigatória de calibração a laser dos eixos X e Y.',
    created_at: '2026-04-16T14:00:00Z'
  },
  {
    id: 'chg44444-4444-4444-4444-444444444444',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_version_id: 'v3333333-3333-3333-3333-333333333333',
    version_number: '03',
    user_id: 'e2222222-2222-2222-2222-222222222222',
    user_name: 'Roberto Líder de Produção',
    user_role: 'GESTOR',
    action: 'Revisão Periódica e Segurança',
    change_reason: 'Atualização de segurança NR-12, inclusão de bloqueio de energia LOTO e protocolo de travamento.',
    created_at: '2026-08-10T09:00:00Z'
  },
  {
    id: 'chg55555-5555-5555-5555-555555555555',
    pop_id: 'pop11111-1111-1111-1111-111111111111',
    pop_version_id: 'v3333333-3333-3333-3333-333333333333',
    version_number: '03',
    user_id: 'e1111111-1111-1111-1111-111111111111',
    user_name: 'Carlos Eduardo Admin',
    user_role: 'ADMINISTRADOR',
    action: 'Publicação de Versão Vigente',
    change_reason: 'Aprovado e publicado oficialmente. Versão 02 tornada obsoleta.',
    created_at: '2026-08-15T14:30:00Z'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'not11111-1111-1111-1111-111111111111',
    employee_id: 'e5555555-5555-5555-5555-555555555555', // Pedro Santos (FUNCIONARIO)
    target_role: 'FUNCIONARIO',
    title: 'Novo POP Aguardando Ciência',
    message: 'Foi atribuída a você a ciência compulsória do procedimento POP-PROD-001 (Versão 03).',
    type: 'warning',
    read: false,
    link: '/pops/pop11111-1111-1111-1111-111111111111',
    email_sent: true,
    created_at: '2026-08-15T14:35:00Z'
  },
  {
    id: 'not22222-2222-2222-2222-222222222222',
    employee_id: 'e1111111-1111-1111-1111-111111111111', // Carlos Admin (ADMINISTRADOR)
    target_role: 'ADMINISTRADOR',
    title: 'Alerta de POP Vencido (Revisão Periódica)',
    message: 'O procedimento POP-LOG-001 (Expedição) ultrapassou a data limite de revisão (Vencido em 01/08/2026). Ação recomendada.',
    type: 'alert',
    read: false,
    link: '/revisoes',
    email_sent: true,
    created_at: '2026-08-02T08:00:00Z'
  },
  {
    id: 'not33333-3333-3333-3333-333333333333',
    employee_id: 'e2222222-2222-2222-2222-222222222222', // Roberto Líder (GESTOR)
    target_role: 'GESTOR',
    title: 'Pendência de Ciência dos Colaboradores',
    message: 'Existe 1 colaborador no setor de Produção (Pedro Santos) pendente de ciência no POP-PROD-001 (v03).',
    type: 'warning',
    read: false,
    link: '/quadro-ciencias',
    email_sent: false,
    created_at: '2026-08-17T09:00:00Z'
  },
  {
    id: 'not44444-4444-4444-4444-444444444444',
    employee_id: 'e1111111-1111-1111-1111-111111111111', // Carlos Admin (ADMINISTRADOR)
    target_role: 'ADMINISTRADOR',
    title: 'Solicitação de Aprovação de POP',
    message: 'O procedimento POP-ADM-001 (Versão 01) foi enviado para análise e aprovação de compliance.',
    type: 'info',
    read: false,
    link: '/aprovacoes',
    email_sent: false,
    created_at: '2026-08-01T14:05:00Z'
  }
];

export const initialEmailLogs: EmailNotificationLog[] = [
  {
    id: 'eml11111-1111-1111-1111-111111111111',
    recipient_email: 'pedro.santos@rufato.com.br',
    recipient_name: 'Pedro Santos',
    recipient_role: 'FUNCIONARIO',
    subject: '[POP Control] Notificação de Novo Procedimento Atribuído: POP-PROD-001',
    body: 'Prezado Pedro Santos,\n\nUm novo Procedimento Operacional Padrão (POP-PROD-001 v03) foi publicado para o seu cargo na Rufato Indústria de Móveis. Acesse a plataforma para confirmar sua ciência.',
    pop_code: 'POP-PROD-001',
    sent_at: '2026-08-15T14:36:00Z',
    status: 'entregue'
  },
  {
    id: 'eml22222-2222-2222-2222-222222222222',
    recipient_email: 'carlos.admin@rufato.com.br',
    recipient_name: 'Carlos Eduardo Admin',
    recipient_role: 'ADMINISTRADOR',
    subject: '[POP Control - ALERTA] POP Vencido para Revisão Periódica: POP-LOG-001',
    body: 'Atenção Administrador,\n\nO procedimento POP-LOG-001 ultrapassou o prazo limite de 6 meses de revisão em 01/08/2026. Por favor acesse o painel de compliance.',
    pop_code: 'POP-LOG-001',
    sent_at: '2026-08-02T08:01:00Z',
    status: 'entregue'
  }
];
