# Contrato da API

Base: `https://<api>/api/v1` — versionado por URI.
Envelope de erro: sempre `ApiErrorResponse` (`statusCode`, `code`, `message`,
`timestamp`, `path`). O frontend reage ao `code`, nunca ao texto.

---

## Autenticação

Emitida pelo **Auth.js** no app web, com sessão **em banco** (tabela `Session`).
A API valida a mesma sessão lendo a tabela — não há JWT duplicado entre os dois
runtimes, e revogar acesso é apagar a linha.

O `SessionGuard` aceita o token de sessão por:

1. Cookie `__Secure-authjs.session-token` (produção) ou `authjs.session-token`
   (dev) — fluxo normal do navegador;
2. Header `Authorization: Bearer <sessionToken>` — clientes sem cookie e testes.

Sem sessão válida: **401** com `code: "UNAUTHENTICATED"`.

### Endpoints do Auth.js (no app web, não na API)

| Método | Rota                        | Função                   |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/auth/signin`          | Início do fluxo de login |
| GET    | `/api/auth/callback/google` | Callback do OAuth        |
| GET    | `/api/auth/session`         | Sessão atual (JSON)      |
| POST   | `/api/auth/signout`         | Encerra a sessão         |

---

## Health

| Método | Rota      | Auth | Descrição                                             |
| ------ | --------- | ---- | ----------------------------------------------------- |
| GET    | `/health` | —    | Status do serviço. Usado pelo healthcheck do Railway. |

---

## Jogadores

Todas exigem sessão.

### `POST /players/link` → 201

Vincula uma conta do Clash of Clans ao usuário logado, comprovando posse pelo
API Token gerado no jogo.

```json
{ "playerTag": "#2PP0JCCL", "apiToken": "abc123" }
```

Retorna `PlayerProfileResponse`.

| Erro                      | `code`                      | HTTP |
| ------------------------- | --------------------------- | ---- |
| Tag fora do formato       | `PLAYER_TAG_INVALID`        | 400  |
| Token não confere         | `PLAYER_TOKEN_INVALID`      | 422  |
| Tag já é de outro usuário | `PLAYER_TAG_ALREADY_LINKED` | 422  |
| Tag não existe no jogo    | `PLAYER_NOT_FOUND_IN_GAME`  | 404  |

A ordem de verificação é intencional: checamos formato e duplicidade **antes**
de chamar a Supercell, porque o API Token do jogador é de uso único.

### `GET /players/me` → 200

Perfil armazenado. **Não chama a Supercell** — leitura de tela nunca consome
rate limit. `404 NOT_FOUND` se o usuário ainda não vinculou conta.

### `POST /players/me/sync` → 200

Reatualiza a partir da Supercell e grava um ponto na série histórica.
Respeita o cache: dentro do TTL responde `fromCache: true` sem requisição
externa — e nesse caso **não** grava snapshot, para não duplicar pontos.

| Erro                         | `code`                     | HTTP |
| ---------------------------- | -------------------------- | ---- |
| Limite da Supercell          | `SUPERCELL_RATE_LIMITED`   | 429  |
| IP fora da allowlist         | `SUPERCELL_AUTH_FAILED`    | 502  |
| Jogo em manutenção / timeout | `SUPERCELL_UNAVAILABLE`    | 503  |
| Falta `SUPERCELL_API_TOKEN`  | `SUPERCELL_NOT_CONFIGURED` | 500  |

### `GET /players/me/history?limit=30` → 200

Série temporal, do mais recente para o mais antigo.
`limit` entre 1 e 365, padrão 30. Retorna `PlayerStatsHistoryResponse`.

---

## Códigos genéricos

Erros levantados pelo próprio framework (guards, `ValidationPipe`, rota
inexistente) também recebem um `code` estável, para o frontend distinguir
"faça login" de "corrija o formulário" sem ler a mensagem:

| Situação                                     | `code`                  | HTTP |
| -------------------------------------------- | ----------------------- | ---- |
| Corpo/query inválidos ou campo não declarado | `VALIDATION_FAILED`     | 400  |
| Sessão ausente, inválida ou expirada         | `UNAUTHENTICATED`       | 401  |
| Sem permissão para o recurso                 | `FORBIDDEN`             | 403  |
| Rota ou recurso inexistente                  | `NOT_FOUND`             | 404  |
| Falha não tratada                            | `INTERNAL_SERVER_ERROR` | 500  |

---

## Ainda não implementado (Fase 3)

Vagas e candidaturas estão **modeladas no banco** (`ClanVacancy`) mas sem
endpoints — criação e matching de vagas são escopo da Fase 3.
