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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function run(cmd, desc, ignoreError = false) {
  console.log(`\n⏳ ${desc}...`);
  try {
    const output = execSync(cmd, { stdio: 'inherit' });
    return output;
  } catch (err) {
    if (!ignoreError) {
      console.error(`❌ Falha ao executar: ${desc}`);
      throw err;
    }
    return null;
  }
}

async function waitForSSH(maxAttempts = 10) {
  console.log('🔍 Verificando conectividade SSH (Porta 22)...');
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      execSync(`ssh -i "${SSH_KEY_PATH}" -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=4 ${REMOTE_USER}@${REMOTE_HOST} "echo OK"`, { stdio: 'pipe' });
      console.log('✅ Conexão SSH estabelecida com sucesso!');
      return true;
    } catch (e) {
      if (i < maxAttempts) {
        console.log(`⏳ Aguardando liberação do Fail2ban na porta 22 (Tentativa ${i}/${maxAttempts} - aguardando 15s)...`);
        await sleep(15000);
      }
    }
  }
  return false;
}

async function main() {
  console.log('🚀 [POP CONTROL] Iniciando Deploy Automático no CloudPanel...');

  if (!fs.existsSync(SSH_KEY_PATH)) {
    console.error(`❌ Chave SSH não encontrada em: ${SSH_KEY_PATH}`);
    process.exit(1);
  }

  // 1. Compilar Frontend
  run('npm run build', '1/5 Compilando frontend React + Tailwind');

  // 2. Compactar arquivos de produção
  console.log('\n⏳ 2/5 Compactando arquivos para envio...');
  const zipPath = path.resolve('deploy-cloudpanel.zip');
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path dist, server.js, package.json -DestinationPath deploy-cloudpanel.zip -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`zip -r deploy-cloudpanel.zip dist server.js package.json`, { stdio: 'inherit' });
  }
  console.log('✅ Pacote gerado com sucesso!');

  // Verificar SSH
  const sshReady = await waitForSSH(8);
  if (!sshReady) {
    console.warn('\n⚠️ O servidor temporariamente bloqueou a porta 22 via Fail2ban por tentativas rápidas.');
    console.warn('💡 Dica: Adicione seu IP (143.137.9.58) na Whitelist do CloudPanel em Segurança.');
    console.log('🔄 Alternativa: Você pode dar "git push" que o GitHub Actions faz o deploy automaticamente.');
    process.exit(1);
  }

  // 3. Enviar pacote via SCP
  const scpCmd = `scp -i "${SSH_KEY_PATH}" -o BatchMode=yes -o StrictHostKeyChecking=no "${zipPath}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/`;
  run(scpCmd, '3/5 Enviando pacote para o servidor via SCP');

  // 4. Descompactar e reiniciar o servidor Node.js
  const remoteCommand = [
    `cd ${REMOTE_DIR}`,
    `unzip -o deploy-cloudpanel.zip`,
    `fuser -k 3031/tcp || true`,
    `nohup ${NODE_BIN} ${REMOTE_DIR}/server.js > ${REMOTE_DIR}/app.log 2>&1 &`,
    `sleep 2`,
    `cat ${REMOTE_DIR}/app.log`
  ].join(' && ');

  const sshCmd = `ssh -i "${SSH_KEY_PATH}" -o BatchMode=yes -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "${remoteCommand}"`;
  run(sshCmd, '4/5 Atualizando arquivos e reiniciando backend no CloudPanel');

  // 5. Testar saúde da aplicação
  console.log('\n⏳ 5/5 Validando disponibilidade da aplicação em produção...');
  try {
    const res = await fetch(HEALTH_URL);
    const data = await res.json();
    if (data.status === 'ok') {
      console.log('\n🎉 ========================================================');
      console.log('✅ DEPLOY CONCLUÍDO COM SUCESSO!');
      console.log(`🌐 Site Online: https://pops.moveisrufato.com.br`);
      console.log(`🗄️ Banco de Dados: ${data.database}`);
      console.log('🎉 ========================================================\n');
    } else {
      console.warn('⚠️ Resposta inesperada da API:', data);
    }
  } catch (err) {
    console.log(`ℹ️ Verifique no navegador: ${HEALTH_URL}`);
  }
}

main().catch(() => process.exit(1));
