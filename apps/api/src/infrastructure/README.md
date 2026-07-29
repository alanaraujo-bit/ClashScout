# infrastructure/ — Detalhes tecnicos substituiveis

Implementa as portas declaradas em `core/application/ports/` e as interfaces de
repositorio de `core/domain/repositories/`.

- `config/` — validacao de env (zod) e acesso tipado a configuracao **(pronto)**
- `app-info/` — adapter do `AppInfoPort` **(pronto)**
- `database/` — Prisma: schema, client e repositorios concretos (Fase 2)
- `supercell/` — cliente HTTP da API oficial da Supercell, com cache e rate
  limit (Fase 2)
- `notifications/` — envio de Web Push (Fase 4)

Trocar Prisma por outro ORM deve impactar **apenas** esta pasta.
