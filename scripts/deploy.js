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

  // 2. Criar pacote zip e enviar via SCP/SSH
  console.log('\n⏳ 2/3 Empacotando e enviando arquivos para o CloudPanel...');
  const zipPath = path.join(process.cwd(), 'deploy-cloudpanel.zip');
  
  try {
    // Cria arquivo zip no Windows usando PowerShell
    execSync(`powershell -Command "Compress-Archive -Path dist,server.js,package.json -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
    
    // Envia arquivo via SCP
    execSync(`scp -i "${SSH_KEY_PATH}" -o StrictHostKeyChecking=no "${zipPath}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/`, { stdio: 'inherit' });
    
    // Descompacta e reinicia o serviço Node
    const restartCmd = `ssh -i "${SSH_KEY_PATH}" -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && unzip -o deploy-cloudpanel.zip && fuser -k 3031/tcp || true; sleep 2; nohup ${NODE_BIN} server.js > app.log 2>&1 & sleep 2; cat app.log"`;
    execSync(restartCmd, { stdio: 'inherit' });
    
    console.log('✅ Arquivos descompactados e servidor reiniciado com sucesso!');
  } catch (err) {
    console.warn('\n⚠️ Falha na transferência direta SSH/SCP: ' + err.message);
    console.warn('💡 Você pode usar: "git push origin main" para deploy automático pelo GitHub Actions.');
  } finally {
    if (fs.existsSync(zipPath)) {
      try { fs.unlinkSync(zipPath); } catch (e) {}
    }
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
