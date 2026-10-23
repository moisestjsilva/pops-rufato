import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const SSH_KEY_PATH = path.join(os.homedir(), '.ssh', 'cloudpanel_deploy');
const REMOTE_USER = 'popsssh';
const REMOTE_HOST = '186.225.65.17';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[Auto-PM2] Iniciando monitor de conexão SSH para configurar PM2...');

  const scriptPath = path.join(process.cwd(), 'scripts', 'remote-setup-pm2.sh');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8').replace(/\r\n/g, '\n');
  const b64 = Buffer.from(scriptContent).toString('base64');

  const remoteCmd = `echo "${b64}" | base64 -d | bash`;
  const sshCmd = `ssh -i "${SSH_KEY_PATH}" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${REMOTE_USER}@${REMOTE_HOST} "${remoteCmd}"`;

  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      console.log(`[Tentativa ${attempt}/20] Conectando ao servidor...`);
      const output = execSync(sshCmd, { stdio: 'pipe', encoding: 'utf-8' });
      console.log('\n--- SAÍDA DO SERVIDOR ---');
      console.log(output);
      console.log('-------------------------');
      console.log('🎉 PM2 E AUTO-REBOOT CONFIGURADOS COM SUCESSO NO SERVIDOR!');
      return;
    } catch (err) {
      console.log(`⏳ SSH temporariamente restrito (tentativa ${attempt}). Aguardando 30s para nova tentativa...`);
      await sleep(30000);
    }
  }

  console.error('❌ Limite de tentativas alcançado.');
}

main();
