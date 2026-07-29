import type { PlayerClanSummary, PlayerStats, PlayStyle } from '@clashscout/shared';

/**
 * Dados de um jogador como a Supercell os entrega, ja normalizados para o nosso
 * vocabulario. Representa uma leitura externa - ainda nao e algo persistido.
 *
 * Reaproveita os tipos de `@clashscout/shared` de proposito: sao tipos puros,
 * sem framework, e manter uma segunda copia aqui so criaria oportunidade de
 * divergencia entre o que a API responde e o que o dominio entende.
 */
export interface SupercellPlayer {
  tag: string;
  name: string;
  townHallWeaponLevel: number | null;
  stats: PlayerStats;
  clan: PlayerClanSummary | null;
  /** Payload original, guardado para nao perder campos novos da Supercell. */
  raw: unknown;
}

/** Perfil como esta persistido no nosso banco. */
export interface StoredPlayerProfile {
  id: string;
  userId: string;
  playerTag: string;
  name: string;
  verifiedAt: Date | null;
  townHallWeaponLevel: number | null;
  stats: PlayerStats;
  clan: PlayerClanSummary | null;
  playStyles: PlayStyle[];
  lastSyncedAt: Date | null;
}

/** Um ponto da serie historica de um perfil. */
export interface StoredPlayerStatsSnapshot {
  capturedAt: Date;
  clanTag: string | null;
  stats: PlayerStats;
}
