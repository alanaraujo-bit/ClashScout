import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
} from '../../../domain/entities/player-profile.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';

/** Teto de pontos por consulta, para uma serie longa nao virar payload gigante. */
const MAX_SNAPSHOTS = 365;
const DEFAULT_SNAPSHOTS = 30;

export interface GetPlayerStatsHistoryOutput {
  profile: StoredPlayerProfile;
  snapshots: StoredPlayerStatsSnapshot[];
}

/** Serie temporal de evolucao do jogador, do mais recente para o mais antigo. */
export class GetPlayerStatsHistoryUseCase {
  constructor(private readonly profiles: PlayerProfileRepository) {}

  async execute(userId: string, limit = DEFAULT_SNAPSHOTS): Promise<GetPlayerStatsHistoryOutput> {
    const profile = await this.profiles.findByUserId(userId);
    if (profile === null) {
      throw new PlayerProfileNotFoundError();
    }

    const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_SNAPSHOTS);
    const snapshots = await this.profiles.listHistory(profile.id, boundedLimit);

    return { profile, snapshots };
  }
}
