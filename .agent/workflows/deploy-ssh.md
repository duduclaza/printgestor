---
description: Deploy direto para produção via SSH
---

# Workflow de Deploy Direto

Este workflow permite atualizar o servidor de produção diretamente via SSH, sem precisar passar pelo Git.

## Passos

// turbo-all

1. Fazer as alterações nos arquivos locais (backend e/ou frontend)

2. Se houver alterações no frontend, fazer build:
   ```bash
   cd c:\Users\Clayton\Desktop\sgqatlaspro\frontend
   npm run build
   ```

3. Copiar build para pasta public do backend:
   ```powershell
   Copy-Item -Path .\frontend\dist\* -Destination .\backend\public\ -Recurse -Force
   ```

4. Conectar via SSH:
   ```bash
   ssh -p 65002 u230868210@93.127.209.151
   ```
   Senha: Tigrinho@1989

5. No servidor, ir para a pasta do projeto:
   ```bash
   cd ~/domains/salmon-eel-603342.hostingersite.com/public_html
   ```

6. Fazer upload dos arquivos alterados via SCP ou editar diretamente

7. Reiniciar o app Node.js (via hPanel ou comandos do servidor)

8. Testar em: https://salmon-eel-603342.hostingersite.com/

## Credenciais

- **SSH**: u230868210@93.127.209.151 porta 65002
- **Senha SSH**: Tigrinho@1989
- **DB Host**: srv1080.hstgr.io
- **DB Name**: u230868210_printgestor
- **DB User**: u230868210_printgestoradm
- **DB Pass**: Pandora@1989
