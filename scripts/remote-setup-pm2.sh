#!/bin/bash
export PATH=$PATH:/home/pops/.nvm/versions/node/v24.21.0/bin
cd /home/pops/htdocs/pops.moveisrufato.com.br

# Matar processo anterior se houver
fuser -k 3031/tcp 2>/dev/null || true
sleep 1

# Iniciar no PM2
pm2 delete pops-rufato 2>/dev/null || true
PORT=3031 pm2 start server.js --name "pops-rufato" --update-env
pm2 save

# Configurar reinício automático pós-reboot no crontab
(crontab -l 2>/dev/null | grep -v "pm2 resurrect"; echo "@reboot export PATH=\$PATH:/home/pops/.nvm/versions/node/v24.21.0/bin; pm2 resurrect") | crontab -

echo "=== PM2 STATUS ==="
pm2 status
echo "=== CRONTAB ==="
crontab -l
echo "=== TEST LOCAL 3031 ==="
sleep 2
curl -s -I http://127.0.0.1:3031/
