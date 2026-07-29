# features/

Fatias verticais do produto. Cada pasta e autocontida (componentes, hooks e
chamadas de API daquele dominio) e nao importa de outra feature.

Previsto:

- `auth/` — login, registro, verificacao de Player Tag (Fase 3)
- `players/` — curriculo do jogador (Fase 3)
- `clans/` — perfil do cla (Fase 3)
- `vacancies/` — vagas e candidaturas (Fase 3)
- `notifications/` — permissao e assinatura de push (Fase 4)

Codigo reutilizavel entre features sobe para `src/components/` ou `src/lib/`.
