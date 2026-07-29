# Integração com a API da Supercell

## 1. As duas coisas chamadas "token"

Confundir as duas é a maior fonte de erro nesta integração.

|            | **Token de desenvolvedor**                                               | **API Token do jogador**                      |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| Quem gera  | Nós, em [developer.clashofclans.com](https://developer.clashofclans.com) | O próprio jogador, no jogo                    |
| Onde       | `SUPERCELL_API_TOKEN`                                                    | Enviado no corpo de `POST /players/link`      |
| Validade   | Longa                                                                    | Poucos minutos, uso único                     |
| Serve para | Autenticar **a nossa aplicação**                                         | Provar que o jogador **é dono daquela conta** |

O jogador gera o dele em **Configurações → Mais Configurações → API Token**.

Consequência prática que está codificada no `LinkPlayerAccountUseCase`: como o
token do jogador queima ao ser usado, verificamos tudo o que dá para verificar
antes de gastá-lo — formato da tag e se ela já pertence a outra pessoa.

---

## 2. O problema do IP fixo (decisão pendente)

O token de desenvolvedor é vinculado a uma **allowlist de IPs**. O IP de saída
do Railway **não é estático**: muda entre deploys.

Resultado: a chamada volta **403**, que a API traduz em
`SUPERCELL_AUTH_FAILED` → HTTP 502, com log explícito apontando a allowlist.
Não viramos 4xx de propósito — não é erro do usuário, é configuração nossa.

O código está preparado para as duas saídas. `SupercellTokenPort` isola a
obtenção do token, e hoje existe um adapter:

- **`StaticSupercellTokenProvider`** (implementado) — lê `SUPERCELL_API_TOKEN`.

### Opção A — Proxy com IP fixo

Um proxy de saída com IP estático (Fixie, QuotaGuard) entre a API e a Supercell.
Cadastra-se o IP do proxy na allowlist e ele nunca muda.

- ✅ Simples, sem lógica extra; o adapter atual já serve.
- ❌ Serviço pago e um salto de rede a mais na latência.

### Opção B — Renovar o token no boot

Autenticar no developer portal com e-mail/senha na subida da aplicação, detectar
o IP de saída atual e criar/atualizar a chave para ele.

- ✅ Sem custo recorrente, sobrevive à troca de IP.
- ❌ Guardar credenciais do portal como segredo; a Supercell limita o número de
  chaves por conta; depende de uma API não documentada oficialmente.

Entra como um segundo adapter da mesma porta — troca de `useClass` no
[supercell.module.ts](../apps/api/src/infrastructure/supercell/supercell.module.ts),
sem tocar no gateway nem nos casos de uso.

> **Enquanto a decisão não sai:** todo o resto funciona. A vinculação de conta e
> o sync são os únicos fluxos que dependem da Supercell, e falham com um erro
> claro e diagnosticável em vez de quebrar silenciosamente.

---

## 3. Estratégia de cache e rate limit

É proibido bater na Supercell a cada carregamento de tela. Três camadas, na
ordem em que atuam:

### 1. Cache com TTL

`CachePort`, implementado por
[`InMemoryCacheService`](../apps/api/src/infrastructure/cache/in-memory-cache.service.ts).

- Chave: `supercell:player:#TAG`
- TTL: `SUPERCELL_CACHE_TTL_SECONDS` (padrão **600s**)
- Teto de 5.000 entradas com descarte do menos usado, mais varredura periódica
  de expirados — um cache sem limite é vazamento de memória com outro nome.

**Limitação consciente:** o cache é por processo. Com mais de uma instância da
API, cada uma tem o seu, e a taxa de chamadas cresce proporcionalmente. Ao
escalar horizontalmente, trocar por Redis — é substituir a classe no módulo, o
`CachePort` não muda.

### 2. Rate limiter

[`TokenBucketRateLimiter`](../apps/api/src/infrastructure/supercell/rate-limiter.ts),
teto em `SUPERCELL_RATE_LIMIT_PER_SECOND` (padrão **10/s**).

Quando o crédito acaba a chamada **espera** em vez de falhar: estourar o limite
da Supercell resulta em bloqueio temporário da chave, e perder a chave é muito
pior que uma requisição 200ms mais lenta.

### 3. Timeout

`SUPERCELL_TIMEOUT_MS` (padrão **8s**), via `AbortSignal.timeout`. Uma chamada
presa na Supercell não pode prender a requisição do usuário.

### Onde o cache **não** é usado

- `verifyPlayerToken` — o token é de uso único e expira em minutos.
- `GET /players/me` — não chama a Supercell **em nenhuma hipótese**; lê o que
  está no banco. Este é o caminho mais quente da aplicação e seria exatamente o
  que estouraria o limite. Atualizar é explícito, via `POST /players/me/sync`.

---

## 4. Tradução de erros

| Status da Supercell       | Erro de domínio                  | HTTP nosso |
| ------------------------- | -------------------------------- | ---------- |
| 400                       | `SupercellUnavailableError`      | 503        |
| 403                       | `SupercellAuthError`             | 502        |
| 404                       | `PlayerNotFoundInSupercellError` | 404        |
| 429                       | `SupercellRateLimitedError`      | 429        |
| 503 (manutenção)          | `SupercellUnavailableError`      | 503        |
| Timeout / rede            | `SupercellUnavailableError`      | 503        |
| Sem `SUPERCELL_API_TOKEN` | `SupercellNotConfiguredError`    | 500        |

Cada um tem um `code` estável no envelope `ApiErrorResponse`, para o frontend
reagir ao código e nunca ao texto da mensagem.
