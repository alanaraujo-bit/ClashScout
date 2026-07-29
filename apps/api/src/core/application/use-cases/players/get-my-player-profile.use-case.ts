import type { StoredPlayerProfile } from '../../../domain/entities/player-profile.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';

/**
 * Le o perfil vinculado ao usuario logado.
 *
 * De proposito NAO chama a Supercell: leitura de tela e o caminho mais quente
 * da aplicacao e seria exatamente o que estouraria o rate limit. A atualizacao
 * e explicita, via SyncPlayerProfileUseCase.
 */
export class GetMyPlayerProfileUseCase {
  constructor(private readonly profiles: PlayerProfileRepository) {}

  async execute(userId: string): Promise<StoredPlayerProfile> {
    const profile = await this.profiles.findByUserId(userId);

    if (profile === null) {
      throw new PlayerProfileNotFoundError();
    }

    return profile;
  }
}
