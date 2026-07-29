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
2. **Root Directory:** deixe na **raiz** (`/`) — _não_ aponte para `apps/web`.
   O [`vercel.json`](../vercel.json) da raiz cuida da configuração:
   - `buildCommand`: `npm run build:web`
   - `outputDirectory`: `apps/web/.next`
   - `framework`: `nextjs`

   Apontar o Root Directory para `apps/web` também funciona, mas exige marcar
   "Include files outside of the Root Directory" para o build enxergar
   `packages/shared` — é a causa mais comum de build quebrado neste monorepo.
   Buildar da raiz evita o problema por construção.

3. **Environment Variables:**

   | Nome                           | Valor                                                   |
   | ------------------------------ | ------------------------------------------------------- |
   | `NEXT_PUBLIC_API_URL`          | URL pública da API no Railway, **sem** `/` final        |
   | `AUTH_SECRET`                  | Gere com `npx auth secret`                              |
   | `AUTH_GOOGLE_ID`               | Client ID do Google Cloud Console                       |
   | `AUTH_GOOGLE_SECRET`           | Client secret do Google                                 |
   | `DATABASE_URL`                 | `DATABASE_PUBLIC_URL` do Postgres do Railway (ver nota) |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Fase 4                                                  |

   > **`DATABASE_URL` na Vercel usa a URL pública, não a interna.** A Vercel está
   > fora da rede privada do Railway e não resolve `*.railway.internal`. O app web
   > só toca o banco para as tabelas do Auth.js, num volume baixo (login), então a
   > ida pelo proxy público é aceitável.

   > **Cuidado ao gravar variáveis pelo CLI no Windows PowerShell:** o stdin é
   > codificado com BOM, e o BOM entra no valor. Numa URL isso a torna relativa e
   > quebra as chamadas em silêncio. Use `printf '%s' 'valor' | vercel env add ...`
   > pelo bash, ou o painel.

4. **Google Cloud Console** → OAuth 2.0 Client ID, com a redirect URI
   `https://<seu-dominio>/api/auth/callback/google` autorizada. Sem isso o login
   falha com `redirect_uri_mismatch`.

5. Deploy. Cada push na `main` publica produção; branches viram preview.

> O `prebuild` de `apps/web` compila `packages/shared` antes do `next build`.
> Se aparecer "Cannot find module '@clashscout/shared'", verifique se o install
> rodou na raiz do workspace.

---

## 3. Railway — backend (`apps/api`)

1. **New Project → Deploy from GitHub repo** e escolha o repositório.
2. **Root Directory:** deixe na raiz (`/`). O `railway.json` cuida do resto:
   - build: `npm run build:api` (o Nixpacks já roda `npm ci` antes; repetir o
     `npm ci` aqui falha com `EBUSY` por causa do cache mount em
     `node_modules/.cache`)
   - start: `npm run start:api`
   - healthcheck: `/api/v1/health`
3. **Add → Database → PostgreSQL**. As migrations rodam sozinhas: o
   `preDeployCommand` do `railway.json` executa `prisma migrate deploy` antes de
   a nova versão subir, e uma migration que falha aborta o deploy em vez de
   deixar a aplicação de pé contra um schema errado.
4. **Variables:**

   | Nome                              | Valor                                                        |
   | --------------------------------- | ------------------------------------------------------------ |
   | `NODE_ENV`                        | `production`                                                 |
   | `NPM_CONFIG_PRODUCTION`           | `false` — **obrigatória**                                    |
   | `CORS_ORIGINS`                    | domínio da Vercel, ex. `https://clashscout.vercel.app`       |
   | `DATABASE_URL`                    | `${{Postgres.DATABASE_URL}}` (referência interna)            |
   | `SUPERCELL_API_TOKEN`             | Token do developer portal — ver [SUPERCELL.md](SUPERCELL.md) |
   | `SUPERCELL_CACHE_TTL_SECONDS`     | opcional, padrão `600`                                       |
   | `SUPERCELL_RATE_LIMIT_PER_SECOND` | opcional, padrão `10`                                        |
   | `SUPERCELL_TIMEOUT_MS`            | opcional, padrão `8000`                                      |

   **Não** defina `PORT`: o Railway injeta a porta e a aplicação já escuta em
   `0.0.0.0` na porta recebida.

   `NPM_CONFIG_PRODUCTION=false` não é opcional: o Railway define essa variável
   como `true` por padrão, o `npm ci` omite as `devDependencies` e o build morre
   com `tsc: not found`.

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
| Build da Vercel não acha o `shared` | Root Directory apontado para `apps/web` em vez da raiz |

---

## 5. Sobre a API da Supercell (preparação para a Fase 2)

O token da API oficial é **vinculado a um IP fixo**, e o IP de saída do Railway
não é estático. Antes da Fase 2 é preciso decidir entre:

- um proxy com IP fixo (ex.: Fixie, QuotaGuard) entre a API e a Supercell; ou
- renovação automática do token pela API de desenvolvedor da Supercell no boot.

Esta decisão é o primeiro item da Fase 2.
