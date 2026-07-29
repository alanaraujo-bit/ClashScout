# Arquitetura

Documento vivo. Descreve as decisões estruturais do ClashScout e, principalmente,
**as regras que impedem o projeto de virar um monólito acoplado** conforme as
fases avançam.

---

## 1. Visão geral

```
┌──────────────┐        HTTPS/JSON        ┌──────────────┐
│   PWA (web)  │ ───────────────────────► │   API (api)  │
│   Next.js    │ ◄─────────────────────── │   NestJS     │
│   Vercel     │                          │   Railway    │
└──────┬───────┘                          └──────┬───────┘
       │                                         │
       │        @clashscout/shared               ├──► PostgreSQL (Railway)
       └──────── contratos e enums ──────────────┤
                                                 └──► API Supercell (Fase 2)
```

O pacote `@clashscout/shared` é a **única** dependência comum. Ele contém apenas
tipos, enums e funções puras — nunca lógica de servidor nem código de UI. Assim o
frontend e o backend evoluem juntos sem se acoplarem.

---

## 2. Backend — Clean Architecture

A dependência aponta **sempre para dentro**:

```
presentation ──► application ──► domain
                     ▲
                     │ implementa as portas
              infrastructure
```

### `core/domain` — o que o negócio é

Entidades, value objects, interfaces de repositório e erros de negócio.
Não conhece HTTP, banco ou framework. É a camada mais estável do sistema.

### `core/application` — o que o sistema faz

Um caso de uso por ação, com um único método `execute()`. Declara **portas**
(interfaces) para tudo que é externo. Não sabe se o dado vem do Postgres ou da
Supercell — só sabe que existe uma porta.

### `infrastructure` — detalhes substituíveis

Implementa as portas: Prisma, cliente HTTP da Supercell, envio de push, leitura
de configuração. Trocar de ORM deve impactar **apenas** esta pasta.

### `presentation` — fronteira HTTP

Controllers, filtros, guards e módulos Nest. Traduz requisição → caso de uso e
retorno → resposta. Se aparecer um `if` de regra de negócio aqui, ele está no
lugar errado.

### Regras não negociáveis

1. `core/` **não pode** importar `@nestjs/*`, Prisma, Express ou qualquer
   biblioteca de infraestrutura.
2. Casos de uso são classes puras, **sem decorators**. A injeção é feita por
   `useFactory` no módulo Nest — é o módulo que conhece o framework, não o caso
   de uso.
3. Portas usam `abstract class` (e não `interface`) porque servem como token de
   injeção em runtime sem acoplar o core ao container do Nest.
4. Só `AppConfigService` lê `process.env`.
5. Todo erro sai pelo filtro global no envelope `ApiErrorResponse`, com um `code`
   estável que o frontend consome — nunca comparando strings de mensagem.

### Fatia de referência (implementada na Fase 1)

`GET /api/v1/health` existe para provar que a amarração funciona:

```
HealthController        (presentation)  recebe o GET
   └─► CheckHealthUseCase  (application)  regra, classe pura
          └─► AppInfoPort   (application)  porta declarada
                 └─► AppInfoProvider (infrastructure)  adapter concreto
```

Toda funcionalidade das Fases 2–4 segue exatamente esse formato.

---

## 3. Frontend — Feature-Sliced

```
app/         rotas e layouts do App Router (fino, só composição)
features/    fatia vertical por domínio (auth, players, clans, vacancies)
components/  ui/ = design system; system/ = utilitários da aplicação
hooks/       hooks transversais
lib/         cliente HTTP, env, helpers
```

Regras:

1. Uma feature **não importa** de outra feature. Se precisar compartilhar, o
   código sobe para `components/` ou `lib/`.
2. Componentes em `components/ui/` não conhecem regra de negócio.
3. Toda chamada de rede passa por `lib/api-client.ts`. Nenhum `fetch` solto —
   é ali que autenticação (Fase 3) e retry entram, em um lugar só.
4. Server Components por padrão; `'use client'` só onde houver estado ou efeito.

---

## 4. Contrato HTTP

- Base: `/api/v1` — versionado por URI (`VersioningType.URI`).
- Sucesso: o recurso, direto no corpo. Listagens usam `PaginatedResponse<T>`.
- Erro: sempre `ApiErrorResponse` (`statusCode`, `code`, `message`, `timestamp`,
  `path`).
- Validação de entrada: `ValidationPipe` global com `whitelist` e
  `forbidNonWhitelisted` — campos não declarados no DTO são rejeitados.

Mapeamento de erros de domínio → HTTP:

| Erro de domínio      | HTTP |
| -------------------- | ---- |
| `NotFoundError`      | 404  |
| `BusinessRuleError`  | 422  |
| `DomainError` (base) | 400  |
| Qualquer outro       | 500  |

---

## 5. Segurança (baseline da Fase 1)

- `helmet` ativo em todas as respostas da API.
- CORS restrito por allowlist explícita (`CORS_ORIGINS`), não `*`.
- Headers de segurança no frontend via `vercel.json`.
- Segredos apenas em variáveis de ambiente; `.env` fora do Git.
- Erros 500 nunca expõem stack trace no corpo da resposta.

Autenticação, autorização por papel e rate limiting entram nas Fases 2 e 3.

---

## 6. Decisões e justificativas

| Decisão                        | Por quê                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Monorepo com npm workspaces    | Contrato compartilhado sem publicar pacote; sem ferramenta extra além do npm.                                    |
| NestJS em vez de Express       | O container de DI é o que torna a inversão de dependência da Clean Architecture prática, e não cerimônia manual. |
| Zod para validar env           | Falha no boot, não em produção no meio de uma requisição.                                                        |
| Caso de uso sem decorator      | Mantém `core/` testável sem subir o container do Nest — veja o teste do `CheckHealthUseCase`.                    |
| Tailwind v4 com tokens CSS     | Tokens em CSS nativo permitem tema claro/escuro e áreas seguras do iOS sem JS.                                   |
| `shared` compilado para `dist` | Evita depender de transpilação cruzada entre dois bundlers diferentes.                                           |
