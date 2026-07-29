# core/ — Camada independente de framework

Nada aqui pode importar `@nestjs/*`, Prisma, Express ou qualquer detalhe de
infraestrutura. Esta e a regra que mantem a arquitetura viva ao longo das fases.

## `domain/`

O que o negocio **e**, sem depender de tecnologia.

- `entities/` — Player, Clan, Vacancy, Application (Fase 3)
- `value-objects/` — PlayerTag, TownHallLevel, TrophyRange (Fase 3)
- `repositories/` — **interfaces** de persistencia; a implementacao Prisma vive
  em `infrastructure/database/` (Fase 2)
- `errors/` — erros de negocio traduzidos para HTTP na apresentacao

## `application/`

O que o sistema **faz**.

- `use-cases/` — uma classe por acao, com um metodo `execute()`
- `ports/` — interfaces de servicos externos (ex.: `SupercellGatewayPort`)
- `dtos/` — entrada e saida dos casos de uso

Direcao das dependencias: `presentation -> application -> domain`.
A infraestrutura aponta para dentro, implementando as portas.
