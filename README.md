# ClashScout

Plataforma de recrutamento para **Clash of Clans** — um "LinkedIn de clãs".
Jogadores publicam seu currículo (perfil, estilo de jogo, histórico); líderes
publicam vagas; a plataforma conecta os dois lados com verificação de identidade
via API oficial da Supercell.

> **Status:** Fase 1 concluída — infraestrutura, estrutura modular e pipeline de
> build funcionando ponta a ponta. Sem banco de dados e sem autenticação ainda.

---

## Stack

| Camada        | Tecnologia                             | Hospedagem |
| ------------- | -------------------------------------- | ---------- |
| Frontend      | Next.js 16 (App Router) + Tailwind 4   | Vercel     |
| Backend       | NestJS 11 (Clean Architecture)         | Railway    |
| Banco         | PostgreSQL + Prisma _(Fase 2)_         | Railway    |
| Compartilhado | TypeScript puro (`@clashscout/shared`) | —          |
| Integração    | API oficial da Supercell _(Fase 2)_    | —          |

Monorepo com **npm workspaces**: um único `npm install` na raiz, dois deploys
independentes.

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
│   └── shared/                     # contratos, enums e utils usados pelos dois lados
│
├── docs/                           # arquitetura, deploy e roadmap
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

---

## Variáveis de ambiente

Nenhum `.env` real é versionado. Os arquivos `.env.example` são a referência.

**API** (`apps/api/.env`) — `NODE_ENV`, `PORT`, `CORS_ORIGINS`, `DATABASE_URL`,
`SUPERCELL_API_BASE_URL`, `SUPERCELL_API_TOKEN`, `JWT_SECRET`.

**Web** (`apps/web/.env.local`) — `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

A API valida o ambiente no boot com Zod e **falha imediatamente** se algo
obrigatório faltar, em vez de quebrar dentro de um caso de uso.

---

## Deploy

Resumo — passo a passo em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

- **Vercel** → Root Directory `apps/web`. Cada push na `main` publica o PWA.
- **Railway** → repositório inteiro; `railway.json` define build, start e o
  healthcheck em `/api/v1/health`.

---

## Roadmap

| Fase | Escopo                                                          | Status        |
| ---- | --------------------------------------------------------------- | ------------- |
| 1    | Infraestrutura, repositório, estrutura modular, deploy configs  | ✅ Concluída  |
| 2    | Modelagem PostgreSQL/Prisma + integração com a API da Supercell | ⏳ Aguardando |
| 3    | Autenticação, perfis de jogador e criação de vagas              | ⏳ Aguardando |
| 4    | UI/UX Apple-like, Service Workers e Push Notifications          | ⏳ Aguardando |

Detalhamento em [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Nota sobre `npm audit`

O `npm audit` reporta advisories de **dependências transitivas** de `next`
(`postcss`, `sharp`) e do ferramental de dev (`minimatch`/`brace-expansion` via
Jest e ESLint). Não há correção não-destrutiva disponível: `npm audit fix --force`
rebaixaria o Next para a versão 9. Nenhuma delas é código nosso; a resolução vem
com o próximo patch do Next. Reavaliar a cada atualização de dependências.
