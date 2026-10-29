import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function upsertRow(conn, tableName, row) {
  const keys = Object.keys(row);
  if (keys.length === 0) return;

  const cols = keys.map(k => `\`${k}\``).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const updates = keys
    .filter(k => k !== 'id')
    .map(k => `\`${k}\` = VALUES(\`${k}\`)`)
    .join(', ');

  const values = keys.map(k => {
    const val = row[k];
    if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
      return JSON.stringify(val);
    }
    return val;
  });

  const sql = updates
    ? `INSERT INTO \`${tableName}\` (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`
    : `INSERT IGNORE INTO \`${tableName}\` (${cols}) VALUES (${placeholders})`;

  await conn.query(sql, values);
}

export async function autoRestoreDatabaseIfNeeded(pool) {
  const migrationDir = path.join(__dirname, '..', 'database', 'migration');
  const corePath = path.join(migrationDir, 'core.json.gz');

  if (!fs.existsSync(corePath)) {
    console.log('[MIGRAÇÃO] Pacote database/migration/core.json.gz não encontrado. Pulando auto-restauração.');
    return;
  }

  // Aguarda o banco MySQL ficar pronto (útil no primeiro boot do Coolify / Docker Compose)
  let connected = false;
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      await pool.query('SELECT 1');
      connected = true;
      break;
    } catch (err) {
      console.log(`[MIGRAÇÃO] Aguardando MySQL iniciar (tentativa ${attempt}/20)...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (!connected) {
    console.error('[MIGRAÇÃO] Não foi possível conectar ao MySQL após 20 tentativas.');
    return;
  }

  // Tenta ajustar max_allowed_packet para suportar POPs grandes com fotos em Base64
  try {
    await pool.query('SET GLOBAL max_allowed_packet = 268435456');
  } catch (e) {}

  const coreRaw = zlib.gunzipSync(fs.readFileSync(corePath)).toString('utf-8');
  const coreData = JSON.parse(coreRaw);

  const conn = await pool.getConnection();
  try {
    try {
      await conn.query('SET SESSION max_allowed_packet = 268435456');
    } catch (e) {}

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Garantir que todas as 14 tabelas existam com o schema exato de produção
    for (const [tableName, createSql] of Object.entries(coreData.schemas || {})) {
      const safeCreateSql = createSql.replace(
        /^CREATE TABLE/i,
        'CREATE TABLE IF NOT EXISTS'
      );
      await conn.query(safeCreateSql);
    }

    // 2. Verificar se o banco já possui todos os POPs e colaboradores migrados
    const [[empCountRow]] = await conn.query('SELECT COUNT(*) as total FROM `employees`');
    const [[popCountRow]] = await conn.query('SELECT COUNT(*) as total FROM `pops`');
    const [[verCountRow]] = await conn.query('SELECT COUNT(*) as total FROM `pop_versions`');

    const expectedEmps = (coreData.tables?.employees || []).length;
    const expectedPops = (coreData.tables?.pops || []).length;

    if (
      empCountRow.total >= expectedEmps &&
      popCountRow.total >= expectedPops &&
      verCountRow.total >= expectedPops
    ) {
      console.log(
        `[MIGRAÇÃO] Banco de dados já está populado e íntegro (${empCountRow.total} logins, ${popCountRow.total} POPs, ${verCountRow.total} versões).`
      );
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      return;
    }

    console.log('[MIGRAÇÃO] Banco novo/incompleto detectado! Iniciando restauração automática de 100% dos dados de produção...');

    // 3. Restaurar tabelas principais (empresas, setores, cargos, logins/senhas, POPs, atribuições, logs)
    const tableOrder = [
      'companies',
      'departments',
      'positions',
      'employees',
      'pops',
      'pop_assignments',
      'acknowledgements',
      'signatures',
      'approvals',
      'audit_logs',
      'app_notifications',
      'pop_change_logs',
      'email_notification_logs'
    ];

    for (const tableName of tableOrder) {
      const rows = coreData.tables?.[tableName] || [];
      for (const row of rows) {
        await upsertRow(conn, tableName, row);
      }
      if (rows.length > 0) {
        console.log(`[MIGRAÇÃO] Restaurada tabela ${tableName}: ${rows.length} registros.`);
      }
    }

    // 4. Restaurar chunks de pop_versions (com todas as imagens e conteúdos dos POPs)
    const files = fs
      .readdirSync(migrationDir)
      .filter(f => /^versions_\d+\.json\.gz$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    let totalVersionsRestored = 0;
    for (const file of files) {
      const chunkPath = path.join(migrationDir, file);
      const versions = JSON.parse(zlib.gunzipSync(fs.readFileSync(chunkPath)).toString('utf-8'));
      for (const verRow of versions) {
        await upsertRow(conn, 'pop_versions', verRow);
        totalVersionsRestored++;
      }
      console.log(`[MIGRAÇÃO] Pacote ${file} restaurado (${versions.length} versões de POPs).`);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(
      `✅ [MIGRAÇÃO CONCLUÍDA] 100% da estrutura, ${expectedEmps} logins/usuários, ${expectedPops} POPs e ${totalVersionsRestored} versões com imagens restaurados com sucesso!`
    );
  } catch (err) {
    console.error('❌ [MIGRAÇÃO] Erro durante restauração automática:', err.message);
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {}
  } finally {
    conn.release();
  }
}
