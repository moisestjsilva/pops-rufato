import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// 4. FUNCIONÁRIOS (Employees)
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
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { 
      id, user_id, company_id, department_id, position_id, 
      full_name, cpf, registration_number, email, phone, 
      role, admission_date, status 
    } = req.body;
    const empId = id || `emp-${Date.now()}`;
    await pool.query(
      `INSERT INTO employees 
        (id, user_id, company_id, department_id, position_id, full_name, cpf, registration_number, email, phone, role, admission_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empId, user_id || null, company_id, department_id, position_id, 
        full_name, cpf, registration_number, email, phone || null, 
        role || 'FUNCIONARIO', admission_date || new Date().toISOString().split('T')[0], status || 'active'
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
      role, admission_date, status 
    } = req.body;
    await pool.query(
      `UPDATE employees SET 
        company_id = ?, department_id = ?, position_id = ?, 
        full_name = ?, cpf = ?, registration_number = ?, email = ?, 
        phone = ?, role = ?, admission_date = ?, status = ? 
       WHERE id = ?`,
      [
        company_id, department_id, position_id, 
        full_name, cpf, registration_number, email, 
        phone, role, admission_date, status, req.params.id
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[POP CONTROL] Servidor Node.js rodando na porta ${PORT}`);
  console.log(`[POP CONTROL] Banco configurado em ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});
