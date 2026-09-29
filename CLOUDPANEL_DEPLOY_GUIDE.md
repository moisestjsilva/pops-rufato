# Guia de Deploy & Conexão: pops.moveisrufato.com.br

Este guia foi personalizado com as suas configurações exatas já cadastradas no CloudPanel:

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Domínio do Site** | `pops.moveisrufato.com.br` |
| **Usuário do Site** | `pops` |
| **Porta da Aplicação Node.js** | `3031` |
| **Usuário do Banco MySQL** | `pops` |
| **Porta do Banco** | `3306` (Host: `127.0.0.1`) |
| **Usuário SSH** | `popsssh` |

---

## 🗄️ Passo 1: Importar as Tabelas no phpMyAdmin

O script SQL otimizado para o seu banco já está pronto em `database/schema_mysql.sql`.

1. No CloudPanel, acesse **Databases**.
2. Clique no link **phpMyAdmin** ao lado do seu banco de dados.
3. Faça login com o usuário **`pops`** e a senha que você definiu ao criar o banco.
4. No menu lateral esquerdo do phpMyAdmin, clique no nome do seu banco de dados.
5. No topo da tela, clique na aba **Importar** (ou **SQL**):
   - **Pela aba Importar**: Escolha o arquivo `database/schema_mysql.sql` do projeto e clique em **Executar** no rodapé.
   - **Pela aba SQL**: Abra o arquivo `database/schema_mysql.sql` no seu computador, copie todo o texto, cole na caixa do phpMyAdmin e clique em **Executar**.
6. Pronto! As 14 tabelas (empresas, setores, cargos, colaboradores, POPs, versões e assinaturas) serão criadas e populadas com os dados da Rufato Móveis.

---

## ⚙️ Passo 2: Criar o arquivo `.env` no CloudPanel

No servidor CloudPanel, acesse a pasta da aplicação (`/home/pops/htdocs/pops.moveisrufato.com.br/`) via **File Manager** do CloudPanel ou SSH e crie o arquivo `.env` com o seguinte conteúdo:

```env
PORT=3031
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=pops
DB_USER=pops
DB_PASSWORD=coloque_aqui_a_senha_do_banco_pops
APP_URL=https://pops.moveisrufato.com.br
```

*(Substitua `DB_NAME` caso o nome do banco seja diferente de `pops`, ex: `pops_db`).*

---

## 🌐 Passo 3: Configurações do Site Node.js no CloudPanel

No CloudPanel, em **Sites** > clique em **`pops.moveisrufato.com.br`**:

1. Na aba **Node.js Settings**:
   - **App Port**: `3031`
   - **Entry Point**: `server.js`
   - **Run Script**: `start`
2. Na aba **Vhost (Nginx)**:
   Certifique-se de que o Nginx encaminhe as requisições para a porta `3031` do Node.js:
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3031;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
       client_max_body_size 50M;
   }
   ```
3. Na aba **SSL/TLS**: Ative o certificado SSL gratuito (Let's Encrypt).

---

## 🚀 Passo 4: Configurar o Deploy Automático no GitHub Actions

No seu repositório no GitHub:
1. Acesse **Settings** > **Secrets and variables** > **Actions**.
2. Clique em **New repository secret** e adicione:

| Secret Name | Valor a Inserir |
| :--- | :--- |
| `CLOUDPANEL_HOST` | IP público do seu servidor CloudPanel (ex: `198.51.100.25`) |
| `CLOUDPANEL_SSH_USER` | `popsssh` |
| `CLOUDPANEL_SITE_USER` | `pops` |
| `CLOUDPANEL_SITE` | `pops.moveisrufato.com.br` |
| `CLOUDPANEL_SSH_KEY` | Conteúdo da chave privada SSH autorizada para o usuário `popsssh` |

3. Para autorizar a chave SSH no CloudPanel:
   - Em **Sites** > `pops.moveisrufato.com.br` > **SSH Users** > edite o usuário `popsssh` e adicione a chave pública SSH.

---

## 🔍 Passo 5: Testar e Validar

Após o deploy ou após iniciar o servidor, teste os seguintes acessos no navegador:

1. **Teste de Saúde do Backend e Banco de Dados**:
   `https://pops.moveisrufato.com.br/api/health`

   Retorno esperado:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2026-09-29T11:40:00.000Z"
   }
   ```

2. **Acesso ao Sistema POP Control**:
   `https://pops.moveisrufato.com.br`

Os dados que você cadastrar, aprovar ou assinar no sistema serão lidos e salvos diretamente no seu MySQL, e você poderá consultar todas as linhas a qualquer momento pelo **phpMyAdmin**!
