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

## ⏳ Fase 2 — Banco de dados e integração Supercell

- Decidir a estratégia de IP fixo para o token da Supercell (ver
  [DEPLOYMENT.md](DEPLOYMENT.md#5-sobre-a-api-da-supercell-preparação-para-a-fase-2))
- Schema Prisma: `User`, `PlayerProfile`, `Clan`, `Vacancy`, `Application`
- Migrations e seed de desenvolvimento
- `SupercellGatewayPort` + adapter com cache e respeito ao rate limit
- Verificação de Player Tag por API Token do jogo
- Repositórios concretos implementando as interfaces do domínio

## ⏳ Fase 3 — Autenticação, perfis e vagas

- Registro e login com JWT; guards por papel (`PLAYER`, `LEADER`, `ADMIN`)
- Currículo do jogador: estilo de jogo, disponibilidade, histórico
- Perfil de clã e publicação de vagas
- Candidaturas e fluxo de aprovação
- Busca e filtros (TH, troféus, estilo de jogo, idioma)

## ⏳ Fase 4 — UI/UX, PWA e Push

- Design system Apple-like: Sheet, ActionSheet, transições com spring, hápticos
- Service Worker, estratégias de cache e modo offline
- Ícones PWA em PNG (192/512, incluindo `maskable`) e splash screens iOS
- Web Push (VAPID) para recrutamento, aprovação e mensagens
- Auditoria de Lighthouse e acessibilidade
