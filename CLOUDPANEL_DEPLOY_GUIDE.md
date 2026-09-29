# Guia Rápido de Deploy no CloudPanel

Este repositório já está configurado com o GitHub Actions em `.github/workflows/deploy.yml` para realizar o deploy automaticamente a cada `git push` na branch `main`.

---

## 1. Configurar Secrets no Repositório do GitHub

No seu repositório no GitHub:
1. Acesse **Settings** > **Secrets and variables** > **Actions**.
2. Clique no botão verde **New repository secret** e adicione:

| Secret Name | O que colocar | Exemplo |
| :--- | :--- | :--- |
| `CLOUDPANEL_HOST` | IP público ou domínio do seu servidor | `198.51.100.25` |
| `CLOUDPANEL_USER` | Nome do usuário do site criado no CloudPanel | `pop-user` |
| `CLOUDPANEL_SITE` | Domínio cadastrado no CloudPanel | `pop.suaempresa.com.br` |
| `CLOUDPANEL_SSH_KEY` | Chave privada SSH autorizada no servidor | Conteúdo do arquivo `~/.ssh/id_ed25519` |

---

## 2. Gerar ou Cadastrar a Chave SSH no CloudPanel

Se você ainda não tem uma chave SSH para o usuário do site no CloudPanel:

1. No terminal do seu computador (ou no CloudPanel em **SSH Users**):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-cloudpanel" -f ~/.ssh/cloudpanel_deploy
   ```
2. Adicione a **chave pública** (`cloudpanel_deploy.pub`) no CloudPanel em:
   - **Sites** > Selecione seu site > **SSH Users** > **Add SSH Key**.
3. Adicione a **chave privada** (`cloudpanel_deploy`) no secret `CLOUDPANEL_SSH_KEY` do GitHub.

---

## 3. Configuração do Vhost (Nginx) no CloudPanel

Como a aplicação é uma Single Page Application (React Router SPA), é necessário que o Nginx redirecione todas as rotas para o `index.html`.

1. No CloudPanel, vá em **Sites** > Selecione seu site > aba **Vhost**.
2. No bloco `server`, adicione ou certifique-se de ter a diretiva:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

3. Clique em **Save**.

---

## 4. Testar o Deploy

Basta enviar um commit para a branch `main`:
```bash
git add .
git commit -m "feat: configurando deploy automatico cloudpanel"
git push origin main
```

Acompanhe a execução em tempo real na aba **Actions** do seu repositório no GitHub.
