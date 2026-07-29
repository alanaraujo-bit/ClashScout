# presentation/ — Fronteira HTTP

Traduz requisicao HTTP em chamada de caso de uso e o retorno em resposta.
Nao contem regra de negocio: se houver um `if` de negocio aqui, ele esta no
lugar errado.

- `modules/` — modulos Nest que amarram porta -> adapter -> caso de uso
- `http/filters/` — filtro global de excecoes **(pronto)**
- `http/interceptors/` — logging e serializacao de resposta
- `http/guards/` — autenticacao e autorizacao por papel (Fase 3)

Rotas seguem o padrao `/api/v1/<recurso>`, versionadas por URI.
