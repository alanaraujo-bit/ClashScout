import type {
  PlayerProfileResponse,
  PlayerStatsHistoryResponse,
  PlayerStatsSnapshotResponse,
} from '@clashscout/shared';

import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
} from '../../../core/domain/entities/player-profile.entity';

/**
 * Converte tipos de dominio no contrato HTTP publico.
 *
 * Fica na apresentacao de proposito: e aqui que `Date` vira string ISO e que
 * decidimos o que sai na resposta. O dominio nao deve conhecer esse formato -
 * e por isso que `rawData`, por exemplo, nunca chega ao cliente.
 */
export function toPlayerProfileResponse(
  profile: StoredPlayerProfile,
  fromCache: boolean,
): PlayerProfileResponse {
  return {
    id: profile.id,
    playerTag: profile.playerTag,
    name: profile.name,
    verifiedAt: profile.verifiedAt?.toISOString() ?? null,
    townHallWeaponLevel: profile.townHallWeaponLevel,
    stats: profile.stats,
    clan: profile.clan,
    playStyles: profile.playStyles,
    lastSyncedAt: profile.lastSyncedAt?.toISOString() ?? null,
    fromCache,
  };
}

export function toStatsHistoryResponse(
  playerTag: string,
  snapshots: StoredPlayerStatsSnapshot[],
): PlayerStatsHistoryResponse {
  return {
    playerTag,
    snapshots: snapshots.map((snapshot): PlayerStatsSnapshotResponse => ({
      capturedAt: snapshot.capturedAt.toISOString(),
      clanTag: snapshot.clanTag,
      ...snapshot.stats,
    })),
  };
}
