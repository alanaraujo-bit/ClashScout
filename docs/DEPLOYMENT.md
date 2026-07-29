# Deploy

Dois serviços independentes a partir de um único repositório.

---

## 1. GitHub

```bash
git remote -v          # deve apontar para alanaraujo-bit/ClashScout
git add .
git commit -m "chore: fase 1 - infraestrutura e estrutura modular"
git push -u origin main
```

---

## 2. Vercel — frontend (`apps/web`)

1. **Add New → Project** e importe `alanaraujo-bit/ClashScout`.
2. Em **Root Directory**, selecione `apps/web` e **marque
   "Include files outside of the Root Directory"** — sem isso o build não
   enxerga `packages/shared` nem a raiz do workspace.
3. Framework preset: **Next.js** (detectado automaticamente).
4. Build e install já vêm do `apps/web/vercel.json`; não sobrescreva no painel.
5. **Environment Variables:**

   | Nome                           | Valor                                        |
   | ------------------------------ | -------------------------------------------- |
   | `NEXT_PUBLIC_API_URL`          | URL pública da API no Railway, sem `/` final |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Fase 4                                       |

6. Deploy. Cada push na `main` publica produção; branches viram preview.

> O `prebuild` compila `packages/shared` antes do `next build`. Se o build falhar
> com "Cannot find module '@clashscout/shared'", quase sempre é a opção
> "Include files outside of the Root Directory" desmarcada.

---

## 3. Railway — backend (`apps/api`)

1. **New Project → Deploy from GitHub repo** e escolha o repositório.
2. **Root Directory:** deixe na raiz (`/`). O `railway.json` cuida do resto:
   - build: `npm ci && npm run build:api`
   - start: `npm run start:api`
   - healthcheck: `/api/v1/health`
3. **Add → Database → PostgreSQL** (usado a partir da Fase 2).
4. **Variables:**

   | Nome                  | Valor                                                  |
   | --------------------- | ------------------------------------------------------ |
   | `NODE_ENV`            | `production`                                           |
   | `CORS_ORIGINS`        | domínio da Vercel, ex. `https://clashscout.vercel.app` |
   | `DATABASE_URL`        | `${{Postgres.DATABASE_URL}}` (referência)              |
   | `SUPERCELL_API_TOKEN` | Fase 2                                                 |
   | `JWT_SECRET`          | Fase 3 — segredo longo e aleatório                     |

   **Não** defina `PORT`: o Railway injeta a porta e a aplicação já escuta em
   `0.0.0.0` na porta recebida.

5. **Settings → Networking → Generate Domain** para obter a URL pública.
6. Copie essa URL para `NEXT_PUBLIC_API_URL` na Vercel e redeploy o frontend.

---

## 4. Verificação pós-deploy

```bash
curl https://<api>.up.railway.app/api/v1/health
# {"status":"ok","service":"ClashScout API","version":"0.1.0", ...}
```

Depois abra o site da Vercel: o indicador de status na home deve ficar **verde**.
Se ficar vermelho, a causa quase sempre é uma destas:

| Sintoma                             | Causa provável                                         |
| ----------------------------------- | ------------------------------------------------------ |
| Erro de CORS no console             | Domínio da Vercel ausente em `CORS_ORIGINS`            |
| 404 em `/api/v1/health`             | `NEXT_PUBLIC_API_URL` com barra no final               |
| Healthcheck falhando no Railway     | Aplicação escutando em `localhost` em vez de `0.0.0.0` |
| Build da Vercel não acha o `shared` | "Include files outside Root Directory" desmarcado      |

---

## 5. Sobre a API da Supercell (preparação para a Fase 2)

O token da API oficial é **vinculado a um IP fixo**, e o IP de saída do Railway
não é estático. Antes da Fase 2 é preciso decidir entre:

- um proxy com IP fixo (ex.: Fixie, QuotaGuard) entre a API e a Supercell; ou
- renovação automática do token pela API de desenvolvedor da Supercell no boot.

Esta decisão é o primeiro item da Fase 2.
