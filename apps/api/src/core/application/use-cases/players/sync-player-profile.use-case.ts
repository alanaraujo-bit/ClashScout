import type { StoredPlayerProfile } from '../../../domain/entities/player-profile.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';
import { PlayerTag } from '../../../domain/value-objects/player-tag.vo';
import type { SupercellGatewayPort } from '../../ports/supercell-gateway.port';

export interface SyncPlayerProfileInput {
  userId: string;
  /** Ignora o cache e forca uma leitura na Supercell. */
  forceRefresh?: boolean;
}

export interface SyncPlayerProfileOutput {
  profile: StoredPlayerProfile;
  fromCache: boolean;
}

/**
 * Reatualiza o perfil do jogador a partir da Supercell e registra um ponto na
 * serie historica.
 *
 * Quando a leitura vem do cache nao gravamos snapshot: seria um ponto duplicado
 * com os mesmos numeros, sujando a serie temporal sem adicionar informacao.
 */
export class SyncPlayerProfileUseCase {
  constructor(
    private readonly profiles: PlayerProfileRepository,
    private readonly supercell: SupercellGatewayPort,
  ) {}

  async execute(input: SyncPlayerProfileInput): Promise<SyncPlayerProfileOutput> {
    const current = await this.profiles.findByUserId(input.userId);
    if (current === null) {
      throw new PlayerProfileNotFoundError();
    }

    const tag = PlayerTag.create(current.playerTag);
    const { player, fromCache } = await this.supercell.fetchPlayer(tag, input.forceRefresh);
    const syncedAt = new Date();

    const profile = await this.profiles.upsertForUser({
      userId: input.userId,
      player,
      syncedAt,
    });

    if (!fromCache) {
      await this.profiles.appendSnapshot(profile.id, {
        capturedAt: syncedAt,
        clanTag: player.clan?.tag ?? null,
        stats: player.stats,
      });
    }

    return { profile, fromCache };
  }
}
