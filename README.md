# ClashScout

Plataforma de recrutamento para **Clash of Clans** — um "LinkedIn de clãs".
Jogadores publicam seu currículo (perfil, estilo de jogo, histórico); líderes
publicam vagas; a plataforma conecta os dois lados com verificação de identidade
via API oficial da Supercell.

> **Status:** Fase 2 concluída — banco modelado e migrado, login com Google,
> integração com a API da Supercell com cache e rate limit. Sem interface visual
> ainda (Fase 4).

---

## Stack

| Camada        | Tecnologia                                   | Hospedagem |
| ------------- | -------------------------------------------- | ---------- |
| Frontend      | Next.js 16 (App Router) + Tailwind 4         | Vercel     |
| Backend       | NestJS 11 (Clean Architecture)               | Railway    |
| Banco         | PostgreSQL + Prisma 7                        | Railway    |
| Autenticação  | Auth.js v5 (Google OAuth)                    | Vercel     |
| Compartilhado | `@clashscout/shared`, `@clashscout/database` | —          |
| Integração    | API oficial da Supercell                     | —          |

Monorepo com **npm workspaces**: um único `npm install` na raiz, dois deploys
independentes.

---

## Ambientes

| Ambiente       | URL                                                                           |
| -------------- | ----------------------------------------------------------------------------- |
| PWA (produção) | https://clashscout-nine.vercel.app                                            |
| API (produção) | https://api-production-de637.up.railway.app                                   |
| Health check   | [`/api/v1/health`](https://api-production-de637.up.railway.app/api/v1/health) |

Ambos deployam automaticamente a cada push na `main`.

---

## Estrutura

```
ClashScout/
├── apps/
│   ├── api/                        # Backend NestJS  -> Railway
│   │   └── src/
│   │       ├── core/               # REGRA: não importa framework
│   │       │   ├── domain/         # entidades, VOs, interfaces de repositório, erros
│   │       │   └── application/    # casos de uso, portas, DTOs
│   │       ├── infrastructure/     # config, banco, clientes HTTP, adapters
│   │       ├── presentation/       # controllers, módulos Nest, filtros, guards
│   │       └── main.ts             # composition root
│   │
│   └── web/                        # Frontend Next.js -> Vercel
│       ├── public/                 # manifest PWA, ícones
│       └── src/
│           ├── app/                # rotas do App Router
│           ├── components/         # design system + utilitários de UI
│           ├── features/           # fatias verticais por domínio
│           ├── hooks/              # hooks transversais
│           └── lib/                # cliente HTTP, env
│
├── packages/
│   ├── shared/                     # contratos, enums e utils (tipos puros)
│   └── database/                   # schema Prisma, migrations e client
│       └── prisma/schema.prisma    # FONTE ÚNICA do modelo de dados
│
├── docs/                           # arquitetura, API, deploy, Supercell, roadmap
├── railway.json                    # configuração de deploy do backend
└── package.json                    # workspaces + scripts orquestradores
```

Cada camada tem um `README.md` explicando o que pode e o que não pode morar nela.
Detalhes completos em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Rodando localmente

Requisitos: **Node 22+** (recomendado 24, ver `.nvmrc`).

```bash
npm install                # instala todos os workspaces

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# aplica as migrations no banco (usa a DATABASE_PUBLIC_URL do Railway)
npm run migrate:deploy

npm run dev:api            # http://localhost:3333/api/v1/health
npm run dev:web            # http://localhost:3000
```

A home do frontend mostra um indicador de status que consulta a API — se ficar
verde, a cadeia web → api → contrato compartilhado está correta.

### Scripts da raiz

| Script              | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev:api`   | API em modo watch                           |
| `npm run dev:web`   | Frontend em modo dev                        |
| `npm run build`     | Compila shared → api → web na ordem correta |
| `npm run test`      | Testes unitários de todos os workspaces     |
| `npm run typecheck` | Checagem de tipos sem emitir                |
| `npm run lint`      | ESLint                                      |
| `npm run format`    | Prettier em todo o repositório              |

Banco de dados:

| Script                   | O que faz                                     |
| ------------------------ | --------------------------------------------- |
| `npm run migrate:dev`    | Cria e aplica migration em desenvolvimento    |
| `npm run migrate:deploy` | Aplica migrations pendentes (usado no deploy) |
| `npm run migrate:status` | Mostra o estado das migrations                |

---

## Variáveis de ambiente

Nenhum `.env` real é versionado. Os arquivos `.env.example` são a referência.

**API** (`apps/api/.env`) — `NODE_ENV`, `PORT`, `CORS_ORIGINS`, `DATABASE_URL`,
`SUPERCELL_API_BASE_URL`, `SUPERCELL_API_TOKEN`,
`SUPERCELL_CACHE_TTL_SECONDS`, `SUPERCELL_RATE_LIMIT_PER_SECOND`,
`SUPERCELL_TIMEOUT_MS`.

**Web** (`apps/web/.env.local`) — `NEXT_PUBLIC_API_URL`, `AUTH_SECRET`,
`AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `DATABASE_URL`,
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

A API valida o ambiente no boot com Zod e **falha imediatamente** se algo
obrigatório faltar, em vez de quebrar dentro de um caso de uso.

---

## Deploy

Resumo — passo a passo em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

- **Vercel** → build a partir da raiz do repositório (`vercel.json` aponta o
  `buildCommand` e o `outputDirectory` para `apps/web`). Cada push na `main`
  publica o PWA.
- **Railway** → repositório inteiro; `railway.json` define build, start e o
  healthcheck em `/api/v1/health`.

---

## Roadmap

| Fase | Escopo                                                         | Status        |
| ---- | -------------------------------------------------------------- | ------------- |
| 1    | Infraestrutura, repositório, estrutura modular, deploy configs | ✅ Concluída  |
| 2    | Banco, autenticação (Google) e integração com a Supercell      | ✅ Concluída  |
| 3    | Vagas, candidaturas e matching                                 | ⏳ Aguardando |
| 4    | UI/UX Apple-like, Service Workers e Push Notifications         | ⏳ Aguardando |

Detalhamento em [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Documentação

| Documento                                    | Conteúdo                                              |
| -------------------------------------------- | ----------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Camadas, regras não negociáveis, decisões             |
| [docs/API.md](docs/API.md)                   | Endpoints, autenticação e códigos de erro             |
| [docs/SUPERCELL.md](docs/SUPERCELL.md)       | Integração, cache, rate limit e o problema do IP fixo |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Passo a passo de Vercel e Railway                     |
| [docs/ROADMAP.md](docs/ROADMAP.md)           | Escopo por fase                                       |

---

## Nota sobre `npm audit`

O `npm audit` reporta advisories de **dependências transitivas** de `next`
(`postcss`, `sharp`) e do ferramental de dev (`minimatch`/`brace-expansion` via
Jest e ESLint). Não há correção não-destrutiva disponível: `npm audit fix --force`
rebaixaria o Next para a versão 9. Nenhuma delas é código nosso; a resolução vem
com o próximo patch do Next. Reavaliar a cada atualização de dependências.
