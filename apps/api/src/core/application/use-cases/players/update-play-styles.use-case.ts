import type { PlayStyle } from '@clashscout/shared';

import type { StoredPlayerProfile } from '../../../domain/entities/player-profile.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';

/** Atualiza os estilos de jogo declarados pelo jogador logado - usados no matching de vagas. */
export class UpdatePlayStylesUseCase {
  constructor(private readonly profiles: PlayerProfileRepository) {}

  async execute(userId: string, playStyles: PlayStyle[]): Promise<StoredPlayerProfile> {
    const profile = await this.profiles.findByUserId(userId);

    if (profile === null) {
      throw new PlayerProfileNotFoundError();
    }

    return this.profiles.updatePlayStyles(profile.id, playStyles);
  }
}
