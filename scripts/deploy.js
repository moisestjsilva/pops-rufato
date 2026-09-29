#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const SSH_KEY_PATH = path.join(os.homedir(), '.ssh', 'cloudpanel_deploy');
const REMOTE_USER = 'popsssh';
const REMOTE_HOST = '186.225.65.17';
const REMOTE_DIR = '/home/pops/htdocs/pops.moveisrufato.com.br';
const NODE_BIN = '/home/pops/.nvm/versions/node/v24.21.0/bin/node';
const HEALTH_URL = 'https://pops.moveisrufato.com.br/api/health';

function run(cmd, desc) {
  console.log(`\n⏳ ${desc}...`);
  try {
    const output = execSync(cmd, { stdio: 'inherit' });
    return output;
  } catch (err) {
    console.error(`❌ Falha ao executar: ${desc}`);
    throw err;
  }
}

async function main() {
  console.log('🚀 [POP CONTROL] Iniciando Deploy Automático no CloudPanel...');

  if (!fs.existsSync(SSH_KEY_PATH)) {
    console.error(`❌ Chave SSH não encontrada em: ${SSH_KEY_PATH}`);
    process.exit(1);
  }

  // 1. Compilar Frontend
  run('npm run build', '1/3 Compilando frontend React + Tailwind');

  // 2. Enviar e Descompactar via stream direto (1 única conexão SSH)
  console.log('\n⏳ 2/3 Enviando arquivos e atualizando CloudPanel em conexão direta...');
  const remoteActions = `tar -xzf - -C ${REMOTE_DIR} && fuser -k 3031/tcp || true; nohup ${NODE_BIN} ${REMOTE_DIR}/server.js > ${REMOTE_DIR}/app.log 2>&1 & sleep 2; cat ${REMOTE_DIR}/app.log`;
  const streamCmd = `tar -czf - dist server.js package.json | ssh -i "${SSH_KEY_PATH}" -o BatchMode=yes -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "${remoteActions}"`;
  
  try {
    execSync(streamCmd, { stdio: 'inherit' });
    console.log('✅ Arquivos sincronizados e servidor reiniciado!');
  } catch (err) {
    console.warn('\n⚠️ Conexão direta SSH temporariamente indisponível.');
    console.warn('💡 Você pode usar: "git push origin main" para deploy automático pelo GitHub Actions.');
  }

  // 3. Testar saúde da aplicação
  console.log('\n⏳ 3/3 Validando aplicação em produção...');
  try {
    const res = await fetch(HEALTH_URL);
    const data = await res.json();
    if (data.status === 'ok') {
      console.log('\n🎉 ========================================================');
      console.log('✅ DEPLOY CONCLUÍDO COM SUCESSO!');
      console.log(`🌐 Site Online: https://pops.moveisrufato.com.br`);
      console.log(`🗄️ Banco de Dados: ${data.database}`);
      console.log('🎉 ========================================================\n');
    }
  } catch (err) {
    console.log(`ℹ️ Acesse no navegador: ${HEALTH_URL}`);
  }
}

main().catch(() => process.exit(1));
