import { BusinessRuleError, DomainError, NotFoundError } from './domain.error';

/** Formato de tag invalido (-> 400). */
export class PlayerTagInvalidError extends DomainError {
  readonly code = 'PLAYER_TAG_INVALID';

  constructor(raw: string) {
    super(`Player Tag em formato invalido: "${raw}".`);
  }
}

/** O API Token do jogo nao corresponde a tag informada (-> 422). */
export class PlayerTokenVerificationFailedError extends BusinessRuleError {
  constructor(playerTag: string) {
    super(
      'PLAYER_TOKEN_INVALID',
      `O API Token informado nao confere com a conta ${playerTag}. ` +
        'Gere um novo token no jogo em Configuracoes > Mais Configuracoes > API Token ' +
        'e tente novamente - o token expira em poucos minutos.',
    );
  }
}

/** A tag ja pertence a outro usuario da plataforma (-> 422). */
export class PlayerTagAlreadyLinkedError extends BusinessRuleError {
  constructor(playerTag: string) {
    super(
      'PLAYER_TAG_ALREADY_LINKED',
      `A conta ${playerTag} ja esta vinculada a outro usuario do ClashScout.`,
    );
  }
}

/** O usuario ainda nao vinculou nenhuma conta do jogo (-> 404). */
export class PlayerProfileNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Perfil de jogador', identifier);
  }
}
