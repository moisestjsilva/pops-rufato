import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import zlib from 'zlib';

dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'pops',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pops',
    charset: 'utf8mb4',
    dateStrings: true
  });

  const outDir = '/tmp/migration';
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const tables = [
    'companies', 'departments', 'positions', 'employees',
    'pops', 'pop_assignments', 'acknowledgements', 'signatures',
    'approvals', 'audit_logs', 'app_notifications', 'pop_change_logs',
    'email_notification_logs'
  ];

  const coreData = {
    exportedAt: new Date().toISOString(),
    schemas: {},
    tables: {}
  };

  for (const t of [...tables, 'pop_versions']) {
    const [createRows] = await pool.query(`SHOW CREATE TABLE \`${t}\``);
    coreData.schemas[t] = createRows[0]['Create Table'];
  }

  for (const t of tables) {
    const [rows] = await pool.query(`SELECT * FROM \`${t}\``);
    coreData.tables[t] = rows;
    console.log(`[Export] Tabela ${t}: ${rows.length} registros`);
  }

  fs.writeFileSync(
    `${outDir}/core.json.gz`,
    zlib.gzipSync(JSON.stringify(coreData), { level: 9 })
  );

  const [verRows] = await pool.query('SELECT * FROM `pop_versions`');
  console.log(`[Export] Tabela pop_versions: ${verRows.length} registros`);

  let chunkIndex = 1;
  let currentChunk = [];
  let currentSize = 0;

  for (const row of verRows) {
    const str = JSON.stringify(row);
    if (currentChunk.length > 0 && currentSize + str.length > 22 * 1024 * 1024) {
      const fileName = `${outDir}/versions_${chunkIndex}.json.gz`;
      fs.writeFileSync(fileName, zlib.gzipSync(JSON.stringify(currentChunk), { level: 9 }));
      chunkIndex++;
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(row);
    currentSize += str.length;
  }

  if (currentChunk.length > 0) {
    const fileName = `${outDir}/versions_${chunkIndex}.json.gz`;
    fs.writeFileSync(fileName, zlib.gzipSync(JSON.stringify(currentChunk), { level: 9 }));
  }

  await pool.end();
  console.log('[Export] Concluído com sucesso!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

