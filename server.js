import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3031;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection Pool
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'pops',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pops',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected', 
      message: error.message,
      configHint: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
      }
    });
  }
});

// -------------------------------------------------------------
// 1. EMPRESAS (Companies)
// -------------------------------------------------------------
app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies ORDER BY corporate_name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { id, corporate_name, trade_name, cnpj, city, state, status } = req.body;
    const compId = id || `comp-${Date.now()}`;
    await pool.query(
      'INSERT INTO companies (id, corporate_name, trade_name, cnpj, city, state, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [compId, corporate_name, trade_name, cnpj, city || null, state || null, status || 'active']
    );
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [compId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { corporate_name, trade_name, cnpj, city, state, status } = req.body;
    await pool.query(
      'UPDATE companies SET corporate_name = ?, trade_name = ?, cnpj = ?, city = ?, state = ?, status = ? WHERE id = ?',
      [corporate_name, trade_name, cnpj, city, state, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. SETORES (Departments)
// -------------------------------------------------------------
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, c.trade_name as company_name 
      FROM departments d 
      LEFT JOIN companies c ON d.company_id = c.id 
      ORDER BY d.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { id, company_id, code, name, manager_name, status } = req.body;
    const deptId = id || `dept-${Date.now()}`;
    await pool.query(
      'INSERT INTO departments (id, company_id, code, name, manager_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [deptId, company_id, code || null, name, manager_name || null, status || 'active']
    );
    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const { company_id, code, name, manager_name, status } = req.body;
    await pool.query(
      'UPDATE departments SET company_id = ?, code = ?, name = ?, manager_name = ?, status = ? WHERE id = ?',
      [company_id, code, name, manager_name, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. CARGOS (Positions)
// -------------------------------------------------------------
app.get('/api/positions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.trade_name as company_name, d.name as department_name 
      FROM positions p 
      LEFT JOIN companies c ON p.company_id = c.id 
      LEFT JOIN departments d ON p.department_id = d.id 
      ORDER BY p.title ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/positions', async (req, res) => {
  try {
    const { id, company_id, department_id, code, title, description, status } = req.body;
    const posId = id || `pos-${Date.now()}`;
    await pool.query(
      'INSERT INTO positions (id, company_id, department_id, code, title, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [posId, company_id, department_id, code || null, title, description || null, status || 'active']
    );
    const [rows] = await pool.query('SELECT * FROM positions WHERE id = ?', [posId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/positions/:id', async (req, res) => {
  try {
    const { company_id, department_id, code, title, description, status } = req.body;
    await pool.query(
      'UPDATE positions SET company_id = ?, department_id = ?, code = ?, title = ?, description = ?, status = ? WHERE id = ?',
      [company_id, department_id, code, title, description, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/positions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM positions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. FUNCIONÁRIOS & CONTROLE DE ACESSO (RBAC)
// -------------------------------------------------------------
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.trade_name as company_name, d.name as department_name, p.title as position_title 
      FROM employees e 
      LEFT JOIN companies c ON e.company_id = c.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      LEFT JOIN positions p ON e.position_id = p.id 
      ORDER BY e.full_name ASC
    `);

    // Formata campos RBAC granulares
    const formatted = rows.map(r => ({
      ...r,
      can_create_pop: Boolean(r.can_create_pop),
      can_edit_pop: Boolean(r.can_edit_pop),
      managed_department_ids: r.managed_department_ids ? JSON.parse(r.managed_department_ids) : []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { 
      id, user_id, company_id, department_id, position_id, 
      full_name, cpf, registration_number, email, phone, 
      role, admission_date, status, account_status,
      managed_department_ids, can_create_pop, can_edit_pop, password 
    } = req.body;
    const empId = id || `emp-${Date.now()}`;
    const managedJson = managed_department_ids ? JSON.stringify(managed_department_ids) : null;

    await pool.query(
      `INSERT INTO employees 
        (id, user_id, company_id, department_id, position_id, full_name, cpf, registration_number, email, phone, role, account_status, managed_department_ids, can_create_pop, can_edit_pop, password, admission_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empId, user_id || null, company_id, department_id, position_id, 
        full_name, cpf, registration_number, email, phone || null, 
        role || 'USUARIO', account_status || 'APROVADO', managedJson,
        can_create_pop ? 1 : 0, can_edit_pop ? 1 : 0, password || '123',
        admission_date || new Date().toISOString().split('T')[0], status || 'active'
      ]
    );
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [empId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { 
      company_id, department_id, position_id, 
      full_name, cpf, registration_number, email, phone, 
      role, account_status, managed_department_ids,
      can_create_pop, can_edit_pop, password, admission_date, status 
    } = req.body;

    const managedJson = managed_department_ids !== undefined ? JSON.stringify(managed_department_ids) : undefined;

    await pool.query(
      `UPDATE employees SET 
        company_id = COALESCE(?, company_id), 
        department_id = COALESCE(?, department_id), 
        position_id = COALESCE(?, position_id), 
        full_name = COALESCE(?, full_name), 
        cpf = COALESCE(?, cpf), 
        registration_number = COALESCE(?, registration_number), 
        email = COALESCE(?, email), 
        phone = COALESCE(?, phone), 
        role = COALESCE(?, role), 
        account_status = COALESCE(?, account_status),
        managed_department_ids = COALESCE(?, managed_department_ids),
        can_create_pop = COALESCE(?, can_create_pop),
        can_edit_pop = COALESCE(?, can_edit_pop),
        password = COALESCE(?, password),
        admission_date = COALESCE(?, admission_date), 
        status = COALESCE(?, status) 
       WHERE id = ?`,
      [
        company_id, department_id, position_id, 
        full_name, cpf, registration_number, email, 
        phone, role, account_status, managedJson,
        can_create_pop !== undefined ? (can_create_pop ? 1 : 0) : null,
        can_edit_pop !== undefined ? (can_edit_pop ? 1 : 0) : null,
        password, admission_date, status, req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AUTENTICAÇÃO REAL (MySQL Backed)
// -------------------------------------------------------------
function generateAuthToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    time: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyAuthToken(token) {
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(json);
    if (!data.id) return null;
    return data;
  } catch (e) {
    return null;
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Informe seu e-mail, CPF ou matrícula.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanCpfDigits = String(identifier).replace(/\D/g, '');

    const [rows] = await pool.query(
      `SELECT e.*, c.trade_name as company_name, d.name as department_name, p.title as position_title 
       FROM employees e 
       LEFT JOIN companies c ON e.company_id = c.id 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN positions p ON e.position_id = p.id 
       WHERE LOWER(TRIM(e.email)) = ? 
          OR (? != '' AND REPLACE(REPLACE(REPLACE(e.cpf, '.', ''), '-', ''), ' ', '') = ?)
          OR LOWER(TRIM(e.registration_number)) = ?
       LIMIT 1`,
      [cleanId, cleanCpfDigits, cleanCpfDigits, cleanId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não localizado no sistema. Verifique o e-mail, CPF ou matrícula digitados.' 
      });
    }

    const user = rows[0];

    // Checagem de Senha
    if (user.password) {
      if (!password || password !== user.password) {
        return res.status(401).json({ success: false, message: 'Senha incorreta. Tente novamente.' });
      }
    }

    // Checagem de Status da Conta (RBAC 3 níveis)
    if (user.account_status === 'PENDENTE') {
      return res.status(403).json({
        success: false,
        message: 'Seu cadastro está pendente de aprovação pelo Super Administrador. Aguarde a liberação do seu acesso.'
      });
    }

    if (user.account_status === 'BLOQUEADO') {
      return res.status(403).json({
        success: false,
        message: 'Acesso bloqueado pela administração do setor. Entre em contato com seu gestor.'
      });
    }

    const formattedUser = {
      ...user,
      can_create_pop: Boolean(user.can_create_pop),
      can_edit_pop: Boolean(user.can_edit_pop),
      managed_department_ids: user.managed_department_ids ? JSON.parse(user.managed_department_ids) : []
    };
    delete formattedUser.password;

    const token = generateAuthToken(user);

    try {
      await pool.query(
        'INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`aud-${Date.now()}`, user.id, 'LOGIN', 'auth', user.id, `Login efetuado com sucesso por ${user.full_name} (${user.role})`, req.ip || null]
      );
    } catch (e) {}

    return res.json({
      success: true,
      token,
      user: formattedUser
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao realizar autenticação: ' + err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, cpf, registration_number, email, phone, password, department_id, company_id, position_id } = req.body;

    if (!full_name || !cpf || !email || !registration_number) {
      return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios (Nome, CPF, Matrícula, E-mail).' });
    }

    const cleanCpfDigits = String(cpf).replace(/\D/g, '');
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanReg = String(registration_number).trim();

    const [existing] = await pool.query(
      `SELECT id FROM employees 
       WHERE LOWER(TRIM(email)) = ? 
          OR REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?
          OR LOWER(TRIM(registration_number)) = ?
       LIMIT 1`,
      [cleanEmail, cleanCpfDigits, cleanReg.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Já existe um colaborador cadastrado com este e-mail, CPF ou matrícula.' 
      });
    }

    let compId = company_id;
    let deptId = department_id;
    let posId = position_id;

    if (!compId) {
      const [comps] = await pool.query('SELECT id FROM companies LIMIT 1');
      compId = comps[0]?.id || 'comp-1';
    }
    if (!deptId) {
      const [depts] = await pool.query('SELECT id FROM departments WHERE company_id = ? LIMIT 1', [compId]);
      deptId = depts[0]?.id || 'dept-1';
    }
    if (!posId) {
      const [pos] = await pool.query('SELECT id FROM positions WHERE department_id = ? LIMIT 1', [deptId]);
      posId = pos[0]?.id || 'pos-1';
    }

    const newEmpId = `emp-${Date.now()}`;
    const userPass = password || '123';

    await pool.query(
      `INSERT INTO employees 
        (id, user_id, company_id, department_id, position_id, full_name, cpf, registration_number, email, phone, role, account_status, managed_department_ids, can_create_pop, can_edit_pop, password, admission_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USUARIO', 'PENDENTE', NULL, 0, 0, ?, CURDATE(), 'active')`,
      [
        newEmpId,
        `usr-${Date.now()}`,
        compId,
        deptId,
        posId,
        full_name.trim(),
        cpf.trim(),
        cleanReg,
        cleanEmail,
        phone || null,
        userPass
      ]
    );

    try {
      await pool.query(
        'INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`aud-${Date.now()}`, newEmpId, 'SOLICITACAO_CADASTRO', 'employees', newEmpId, `Nova solicitação de acesso para ${full_name} (${cleanEmail}) aguardando aprovação`, req.ip || null]
      );
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Solicitação de cadastro registrada com sucesso! Seu acesso está aguardando homologação do Super Administrador.'
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar cadastro: ' + err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAuthToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    const [rows] = await pool.query(
      `SELECT e.*, c.trade_name as company_name, d.name as department_name, p.title as position_title 
       FROM employees e 
       LEFT JOIN companies c ON e.company_id = c.id 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN positions p ON e.position_id = p.id 
       WHERE e.id = ? 
       LIMIT 1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const user = rows[0];

    if (user.account_status === 'BLOQUEADO') {
      return res.status(403).json({ success: false, message: 'Acesso bloqueado.' });
    }

    const formattedUser = {
      ...user,
      can_create_pop: Boolean(user.can_create_pop),
      can_edit_pop: Boolean(user.can_edit_pop),
      managed_department_ids: user.managed_department_ids ? JSON.parse(user.managed_department_ids) : []
    };
    delete formattedUser.password;

    return res.json({ success: true, user: formattedUser });
  } catch (err) {
    console.error('Erro no /api/auth/me:', err);
    return res.status(500).json({ success: false, message: 'Erro interno na validação de sessão.' });
  }
});

// ENDPOINTS ESPECÍFICOS DE RBAC
app.post('/api/auth/approve', async (req, res) => {
  try {
    const { userId, role, managedDeptIds } = req.body;
    const managedJson = managedDeptIds ? JSON.stringify(managedDeptIds) : null;
    await pool.query(
      'UPDATE employees SET account_status = "APROVADO", role = ?, managed_department_ids = ? WHERE id = ?',
      [role || 'USUARIO', managedJson, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/toggle-block', async (req, res) => {
  try {
    const { userId, newStatus } = req.body;
    await pool.query(
      'UPDATE employees SET account_status = ? WHERE id = ?',
      [newStatus || 'BLOQUEADO', userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/permissions', async (req, res) => {
  try {
    const { userId, can_create_pop, can_edit_pop } = req.body;
    await pool.query(
      'UPDATE employees SET can_create_pop = ?, can_edit_pop = ? WHERE id = ?',
      [can_create_pop ? 1 : 0, can_edit_pop ? 1 : 0, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/assign-sectors', async (req, res) => {
  try {
    const { adminId, deptIds } = req.body;
    const managedJson = JSON.stringify(deptIds || []);
    await pool.query(
      'UPDATE employees SET role = "ADMIN", managed_department_ids = ? WHERE id = ?',
      [managedJson, adminId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. POPS (Procedimentos Operacionais Padrão)
// -------------------------------------------------------------
app.get('/api/pops', async (req, res) => {
  try {
    const [popRows] = await pool.query(`
      SELECT p.*, c.trade_name as company_name, d.name as department_name, e.full_name as author_name
      FROM pops p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN employees e ON p.author_id = e.id
      ORDER BY p.code ASC
    `);

    // Fetch versions and assignments for each POP
    const [verRows] = await pool.query(`
      SELECT v.*, a.full_name as author_name, r.full_name as reviewer_name, ap.full_name as approver_name
      FROM pop_versions v
      LEFT JOIN employees a ON v.author_id = a.id
      LEFT JOIN employees r ON v.reviewer_id = r.id
      LEFT JOIN employees ap ON v.approver_id = ap.id
      ORDER BY v.version_number DESC
    `);

    const [asgnRows] = await pool.query('SELECT * FROM pop_assignments');

    const pops = popRows.map(pop => {
      const versions = verRows
        .filter(v => v.pop_id === pop.id)
        .map(v => ({
          ...v,
          content: typeof v.content === 'string' ? JSON.parse(v.content) : v.content
        }));

      const assigned_department_ids = asgnRows
        .filter(a => a.pop_id === pop.id && a.department_id)
        .map(a => a.department_id);

      const assigned_position_ids = asgnRows
        .filter(a => a.pop_id === pop.id && a.position_id)
        .map(a => a.position_id);

      return {
        ...pop,
        versions,
        assigned_department_ids,
        assigned_position_ids
      };
    });

    res.json(pops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pops', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id, company_id, department_id, code, title, author_id,
      responsible_name, classification, current_version, status,
      review_period_months, last_review_date, next_review_date,
      content, assigned_department_ids, assigned_position_ids
    } = req.body;

    const popId = id || `pop-${Date.now()}`;
    const versionNum = current_version || '01';

    await conn.query(
      `INSERT INTO pops 
        (id, company_id, department_id, code, title, author_id, responsible_name, classification, current_version, status, review_period_months, last_review_date, next_review_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        popId, company_id, department_id, code, title, author_id || null,
        responsible_name, classification || 'Operacional', versionNum, status || 'rascunho',
        review_period_months || 12, last_review_date || null, next_review_date
      ]
    );

    // Initial Version
    const verId = `ver-${popId}-${versionNum}`;
    await conn.query(
      `INSERT INTO pop_versions 
        (id, pop_id, version_number, content, change_reason, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        verId, popId, versionNum, JSON.stringify(content || {}),
        'Elaboração inicial do procedimento', author_id || null, status || 'rascunho'
      ]
    );

    // Assignments
    if (Array.isArray(assigned_department_ids)) {
      for (const deptId of assigned_department_ids) {
        await conn.query(
          'INSERT INTO pop_assignments (id, pop_id, department_id) VALUES (?, ?, ?)',
          [`asgn-dept-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, popId, deptId]
        );
      }
    }

    if (Array.isArray(assigned_position_ids)) {
      for (const posId of assigned_position_ids) {
        await conn.query(
          'INSERT INTO pop_assignments (id, pop_id, position_id) VALUES (?, ?, ?)',
          [`asgn-pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, popId, posId]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ id: popId, success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/pops/:id', async (req, res) => {
  try {
    const { title, responsible_name, classification, status, review_period_months, next_review_date, current_version } = req.body;
    await pool.query(
      `UPDATE pops SET 
        title = COALESCE(?, title),
        responsible_name = COALESCE(?, responsible_name),
        classification = COALESCE(?, classification),
        status = COALESCE(?, status),
        review_period_months = COALESCE(?, review_period_months),
        next_review_date = COALESCE(?, next_review_date),
        current_version = COALESCE(?, current_version)
       WHERE id = ?`,
      [title, responsible_name, classification, status, review_period_months, next_review_date, current_version, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. CIÊNCIAS E ASSINATURAS (Acknowledgements & Signatures)
// -------------------------------------------------------------
app.get('/api/acknowledgements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, e.full_name as employee_name, e.registration_number as employee_registration, p.code as pop_code, p.title as pop_title
      FROM acknowledgements a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN pops p ON a.pop_id = p.id
      ORDER BY a.acknowledged_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/acknowledgements', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id, employee_id, pop_id, pop_version_id, version_number,
      confirmation_type, ip_address, user_agent, document_hash,
      term_text, transaction_id, signature_data_url
    } = req.body;

    const ackId = id || `ack-${Date.now()}`;
    const txId = transaction_id || `TX-RUF-${Date.now()}`;

    await conn.query(
      `INSERT INTO acknowledgements 
        (id, employee_id, pop_id, pop_version_id, version_number, confirmation_type, ip_address, user_agent, document_hash, term_text, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ackId, employee_id, pop_id, pop_version_id, version_number,
        confirmation_type || 'eletronica', ip_address || null, user_agent || null,
        document_hash, term_text, txId
      ]
    );

    // Optional graphical signature
    if (signature_data_url) {
      const sigId = `sig-${Date.now()}`;
      await conn.query(
        `INSERT INTO signatures (id, acknowledgement_id, employee_id, signature_data_url, transaction_id, signature_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sigId, ackId, employee_id, signature_data_url, txId, 'assinatura_desenhada']
      );
    }

    await conn.commit();
    res.status(201).json({ id: ackId, transaction_id: txId, success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// -------------------------------------------------------------
// 7. AUDITORIA E LOGS (Audit Logs)
// -------------------------------------------------------------
app.get('/api/audit-logs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, e.full_name as user_name, e.role as user_role
      FROM audit_logs a
      LEFT JOIN employees e ON a.user_id = e.id
      ORDER BY a.created_at DESC
      LIMIT 500
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const { id, user_id, action, entity_name, entity_id, details, ip_address } = req.body;
    const logId = id || `aud-${Date.now()}`;
    await pool.query(
      'INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [logId, user_id || null, action, entity_name, entity_id, details || null, ip_address || null]
    );
    res.status(201).json({ id: logId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND (REACT / VITE DIST)
// -------------------------------------------------------------
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback SPA para Nginx / CloudPanel Node.js
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function ensureRBACSchema() {
  try {
    const [existingCols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employees'"
    );
    const colNames = existingCols.map(c => c.COLUMN_NAME.toLowerCase());

    if (!colNames.includes('account_status')) {
      await pool.query("ALTER TABLE employees ADD COLUMN account_status ENUM('PENDENTE', 'APROVADO', 'BLOQUEADO') NOT NULL DEFAULT 'APROVADO'");
    }
    if (!colNames.includes('managed_department_ids')) {
      await pool.query("ALTER TABLE employees ADD COLUMN managed_department_ids TEXT DEFAULT NULL");
    }
    if (!colNames.includes('can_create_pop')) {
      await pool.query("ALTER TABLE employees ADD COLUMN can_create_pop TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!colNames.includes('can_edit_pop')) {
      await pool.query("ALTER TABLE employees ADD COLUMN can_edit_pop TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!colNames.includes('password')) {
      await pool.query("ALTER TABLE employees ADD COLUMN password VARCHAR(255) DEFAULT '123'");
    }
    try {
      await pool.query("ALTER TABLE employees MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'USUARIO', 'ADMINISTRADOR', 'GESTOR', 'RH', 'FUNCIONARIO') NOT NULL DEFAULT 'USUARIO'");
    } catch (e) {}

    // Garante que todas as contas existentes tenham senha padrão '123' caso nula
    try {
      await pool.query("UPDATE employees SET password = '123' WHERE password IS NULL OR password = ''");
      await pool.query("UPDATE employees SET account_status = 'APROVADO' WHERE account_status IS NULL");
    } catch (e) {}

    // Seed dos usuários padrão para demonstração real do RBAC no MySQL
    const seedUsers = [
      {
        id: 'emp-moises-admin',
        full_name: 'Moisés Silva (Super Admin Global)',
        email: 'moisestj86@gmail.com',
        cpf: '054.892.116-32',
        registration_number: 'RUF-0001',
        role: 'SUPER_ADMIN',
        account_status: 'APROVADO',
        password: '123',
        department_id: 'dept-5',
        can_create_pop: 1,
        can_edit_pop: 1
      },
      {
        id: 'emp-carlos-superadmin',
        full_name: 'Carlos Eduardo (Super Admin)',
        email: 'carlos.admin@rufato.com.br',
        cpf: '111.222.333-44',
        registration_number: '00101',
        role: 'SUPER_ADMIN',
        account_status: 'APROVADO',
        password: '123',
        department_id: 'dept-6',
        can_create_pop: 1,
        can_edit_pop: 1
      },
      {
        id: 'emp-mariana-admin',
        full_name: 'Mariana Souza (Admin de Setor)',
        email: 'mariana.producao@rufato.com.br',
        cpf: '222.333.444-55',
        registration_number: '00204',
        role: 'ADMIN',
        account_status: 'APROVADO',
        password: '123',
        department_id: 'dept-1',
        managed_department_ids: JSON.stringify(['dept-1', 'dept-2']),
        can_create_pop: 1,
        can_edit_pop: 1
      },
      {
        id: 'emp-marcos-admin',
        full_name: 'Marcos Oliveira (Admin de Setor)',
        email: 'marcos.expedicao@rufato.com.br',
        cpf: '333.444.555-66',
        registration_number: '00310',
        role: 'ADMIN',
        account_status: 'APROVADO',
        password: '123',
        department_id: 'dept-4',
        managed_department_ids: JSON.stringify(['dept-4']),
        can_create_pop: 1,
        can_edit_pop: 1
      },
      {
        id: 'emp-roberto-user',
        full_name: 'Roberto Alves (Operador Padrão)',
        email: 'roberto.operador@rufato.com.br',
        cpf: '444.555.666-77',
        registration_number: '00412',
        role: 'USUARIO',
        account_status: 'APROVADO',
        password: '123',
        department_id: 'dept-1',
        can_create_pop: 0,
        can_edit_pop: 0
      },
      {
        id: 'emp-aline-pendente',
        full_name: 'Aline Costa (Cadastro Pendente)',
        email: 'aline.costa@rufato.com.br',
        cpf: '555.666.777-88',
        registration_number: '00530',
        role: 'USUARIO',
        account_status: 'PENDENTE',
        password: '123',
        department_id: 'dept-3',
        can_create_pop: 0,
        can_edit_pop: 0
      }
    ];

    for (const u of seedUsers) {
      const [existing] = await pool.query('SELECT id FROM employees WHERE LOWER(email) = ?', [u.email.toLowerCase()]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO employees 
            (id, company_id, department_id, position_id, full_name, cpf, registration_number, email, role, account_status, managed_department_ids, can_create_pop, can_edit_pop, password, admission_date, status)
           VALUES (?, 'comp-1', ?, 'pos-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')`,
          [
            u.id, u.department_id, u.full_name, u.cpf, u.registration_number, u.email,
            u.role, u.account_status, u.managed_department_ids || null,
            u.can_create_pop || 0, u.can_edit_pop || 0, u.password
          ]
        );
      } else {
        // Atualiza campos de RBAC e senha caso o usuário já existisse
        await pool.query(
          `UPDATE employees SET 
             role = ?, 
             account_status = ?, 
             password = COALESCE(password, '123'),
             managed_department_ids = COALESCE(managed_department_ids, ?)
           WHERE id = ?`,
          [u.role, u.account_status, u.managed_department_ids || null, existing[0].id]
        );
      }
    }

    console.log('[POP CONTROL] Validação e sincronização de usuários RBAC concluída com sucesso.');
  } catch (err) {
    console.warn('[POP CONTROL] Checagem de tabelas RBAC:', err.message);
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[POP CONTROL] Servidor Node.js rodando na porta ${PORT}`);
  console.log(`[POP CONTROL] Banco configurado em ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  await ensureRBACSchema();
});
