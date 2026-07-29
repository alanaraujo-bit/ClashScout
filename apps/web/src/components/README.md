# components/

Componentes de UI sem regra de negocio, reutilizaveis por qualquer feature.

- `ui/` — primitivas do design system Apple-like: Button, Sheet, Card, Toast,
  ActionSheet (Fase 4)
- `system/` — componentes utilitarios da aplicacao (ex.: `api-status-badge`)

Se um componente conhece uma regra de dominio, ele pertence a `src/features/`.
