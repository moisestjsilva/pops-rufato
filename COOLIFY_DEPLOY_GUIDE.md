# Guia de Migração 100% Automática para o Coolify (POP Control - Rufato Móveis)

Toda a estrutura do sistema, código-fonte, banco de dados MySQL (14 tabelas), **21 logins/senhas e permissões RBAC**, **15 setores**, **7 cargos**, **42 POPs** e **todas as fotos em alta definição** já foram extraídos da VPS antiga (`186.225.65.17`) e empacotados em pacotes criptografados/compactados dentro de [`database/migration/`](database/migration/).

Quando o **Coolify** subir o projeto a partir do seu GitHub, o próprio servidor ([`server.js`](server.js) + [`scripts/auto-migrate-db.js`](scripts/auto-migrate-db.js)) detectará automaticamente que o banco de dados na nova VPS está vazio, criará as **14 tabelas** e **restaurará 100% dos logins, senhas, setores, POPs e imagens sozinho no primeiro boot**, sem precisar de SSH ou phpMyAdmin!

---

## Opção A (Recomendada): Subir Tudo Junto via Docker Compose no Coolify

Com o arquivo [`docker-compose.yml`](docker-compose.yml) já incluído no repositório, o Coolify sobe **a Aplicação Node.js + o Banco de Dados MySQL 8.0** já conectados e configurados com suporte a fotos grandes (`--max-allowed-packet=256M`):

1. No painel do **Coolify**, clique em **Projects** > selecione seu projeto (ou crie um novo) > clique em **+ New** > **Public Repository** (ou **Private Repository** via GitHub App).
2. Informe a URL do repositório Git:
   `https://github.com/moisestjsilva/pops-rufato.git`
3. Em **Build Pack**, selecione **`Docker Compose`** (o Coolify lerá automaticamente o arquivo `docker-compose.yml`).
4. No serviço **`app`**:
   - Em **Domains**, coloque: `https://pops.moveisrufato.com.br` (ou a porta `3031`).
5. Clique em **Deploy**!
6. No primeiro boot (leva ~20 segundos), o container `app` conectará no container `mysql` e restaurará automaticamente todos os **21 usuários/logins**, **15 setores** e **42 POPs com imagens**.

---

## Opção B: Se Você Criou o MySQL Separado no Coolify + App via Dockerfile/Nixpacks

Se você preferir criar o banco MySQL separado na aba **Databases** do Coolify e subir apenas o App via Git:

1. No recurso da aplicação no Coolify, escolha **Build Pack**: **`Dockerfile`** (já configurado na raiz do projeto com porta `3031`).
2. Na aba **Environment Variables** da aplicação no Coolify, adicione as variáveis do MySQL criado no Coolify:
   ```env
   PORT=3031
   DB_HOST=seu_host_interno_do_mysql_no_coolify
   DB_PORT=3306
   DB_NAME=pops
   DB_USER=pops
   DB_PASSWORD=sua_senha_do_mysql
   APP_URL=https://pops.moveisrufato.com.br
   ```
3. Clique em **Deploy**. Assim que o container iniciar, ele criará as 14 tabelas no banco e importará automaticamente todos os **21 logins** e **42 POPs**!

---

## Como Validar Antes e Depois de Virar o DNS (`pops.moveisrufato.com.br`)

1. Acesse a URL temporária gerada pelo Coolify (ou `https://pops.moveisrufato.com.br/api/health` após apontar o registro `A` do DNS para o IP da nova VPS).
2. O endpoint `/api/health` retornará exatamente a contagem migrada:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "counts": {
       "employees": 21,
       "departments": 15,
       "pops": 42,
       "pop_versions": 42
     }
   }
   ```
3. Basta apontar o registro **Tipo A** de `pops.moveisrufato.com.br` no seu provedor de DNS para o **IP da nova VPS com Coolify** — o Coolify gerará o certificado SSL (HTTPS) automaticamente.

