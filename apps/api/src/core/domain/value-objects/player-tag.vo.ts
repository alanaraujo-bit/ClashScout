import { isValidPlayerTag, normalizePlayerTag } from '@clashscout/shared';

import { PlayerTagInvalidError } from '../errors/player.errors';

/**
 * Tag de jogador validada e normalizada.
 *
 * Existe para que nenhuma camada precise se perguntar se a string que recebeu
 * ja passou por validacao: se e um `PlayerTag`, passou. As regras de formato
 * vivem em `@clashscout/shared` porque o frontend valida antes de enviar.
 */
export class PlayerTag {
  private constructor(readonly value: string) {}

  /** @throws {PlayerTagInvalidError} se o formato nao for valido. */
  static create(raw: string): PlayerTag {
    if (!isValidPlayerTag(raw)) {
      throw new PlayerTagInvalidError(raw);
    }

    return new PlayerTag(normalizePlayerTag(raw));
  }

  toString(): string {
    return this.value;
  }

  equals(other: PlayerTag): boolean {
    return this.value === other.value;
  }
}
