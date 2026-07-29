# Roadmap

Cada fase só começa após aprovação explícita da anterior.

---

## ✅ Fase 1 — Infraestrutura e repositório

- Monorepo npm workspaces (`apps/web`, `apps/api`, `packages/shared`)
- Backend NestJS com as camadas da Clean Architecture criadas e documentadas
- Frontend Next.js (App Router) com tokens de design e base de PWA
- Pacote de contratos compartilhados
- Validação de ambiente com Zod, filtro global de erros, CORS e Helmet
- Configuração de deploy da Vercel e do Railway
- Pipeline de CI no GitHub Actions
- Fatia vertical de referência: `GET /api/v1/health`

---

## ✅ Fase 2 — Banco de dados, autenticação e integração Supercell

- `packages/database`: schema Prisma como fonte única de verdade do modelo
- Tabelas: `User`, `Account`, `Session`, `VerificationToken`, `PlayerProfile`,
  `PlayerStatsHistory`, `ClanVacancy`
- Migration `init` aplicada ao PostgreSQL do Railway; `migrate deploy` no
  `preDeployCommand`
- Auth.js v5 com Google OAuth e sessão em banco; `SessionGuard` na API
- `SupercellGatewayPort` + adapter HTTP com cache TTL, token bucket e timeout
- Verificação de posse de conta pelo API Token do jogo
- Endpoints de jogador: `link`, `me`, `me/sync`, `me/history`
- 29 testes unitários, incluindo guarda contra divergência dos enums Prisma/shared

**Pendente de decisão do produto:** estratégia de IP fixo para o token da
Supercell — ver [SUPERCELL.md](SUPERCELL.md#2-o-problema-do-ip-fixo-decisão-pendente).

## ⏳ Fase 3 — Vagas, candidaturas e matching

- Autorização por papel (`PLAYER`, `LEADER`, `ADMIN`)
- CRUD de vagas pelo líder, sobre a tabela `ClanVacancy` já modelada
- Perfil de clã (dados vindos de `GET /clans/{tag}` da Supercell)
- Candidaturas e fluxo de aprovação (tabela `Application`)
- Matching: comparar requisitos `min*` da vaga com o `PlayerProfile`
- Busca e filtros (TH, troféus, heróis, estilo de jogo, idioma)
- Rate limiting de entrada na API

## ⏳ Fase 4 — UI/UX, PWA e Push

- Design system Apple-like: Sheet, ActionSheet, transições com spring, hápticos
- Service Worker, estratégias de cache e modo offline
- Ícones PWA em PNG (192/512, incluindo `maskable`) e splash screens iOS
- Upload de foto de perfil e banner de vaga para bucket S3/R2 (campos
  `avatarUrl` e `bannerUrl` já existem no schema)
- Web Push (VAPID) para recrutamento, aprovação e mensagens
- Auditoria de Lighthouse e acessibilidade
