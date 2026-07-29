import { DomainError } from './domain.error';

/**
 * Falhas de sistemas externos. Ficam separadas dos erros de negocio porque a
 * causa e a acao do usuario sao diferentes: aqui nao ha nada que ele possa
 * corrigir no proprio pedido.
 */

/** A tag existe em formato valido, mas nao existe no jogo (-> 404). */
export class PlayerNotFoundInSupercellError extends DomainError {
  readonly code = 'PLAYER_NOT_FOUND_IN_GAME';

  constructor(playerTag: string) {
    super(`Nenhum jogador encontrado com a tag ${playerTag}.`);
  }
}

/**
 * A Supercell recusou nossa credencial (-> 502).
 *
 * Quase sempre significa que o IP de saida nao esta na allowlist do token, e
 * nao que o usuario fez algo errado - por isso nao vira 4xx.
 */
export class SupercellAuthError extends DomainError {
  readonly code = 'SUPERCELL_AUTH_FAILED';

  constructor(detail: string) {
    super(`A API da Supercell recusou nossa credencial: ${detail}`);
  }
}

/** Excedemos o limite da Supercell (-> 429). */
export class SupercellRateLimitedError extends DomainError {
  readonly code = 'SUPERCELL_RATE_LIMITED';

  constructor() {
    super('Limite de requisicoes da API da Supercell atingido. Tente em instantes.');
  }
}

/** Indisponibilidade, timeout ou manutencao do jogo (-> 503). */
export class SupercellUnavailableError extends DomainError {
  readonly code = 'SUPERCELL_UNAVAILABLE';

  constructor(detail: string) {
    super(`A API da Supercell esta indisponivel: ${detail}`);
  }
}

/** Falta configuracao nossa para falar com a Supercell (-> 500). */
export class SupercellNotConfiguredError extends DomainError {
  readonly code = 'SUPERCELL_NOT_CONFIGURED';

  constructor() {
    super('Integracao com a Supercell nao configurada: defina SUPERCELL_API_TOKEN.');
  }
}
