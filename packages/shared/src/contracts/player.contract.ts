import type { PlayStyle } from '../enums/clash.enums';

/** Niveis de heroi. `null` = heroi ainda nao desbloqueado pelo jogador. */
export interface HeroLevels {
  barbarianKing: number | null;
  archerQueen: number | null;
  minionPrince: number | null;
  grandWarden: number | null;
  royalChampion: number | null;
}

/** Estatisticas de um jogador em um instante. Reaproveitado no historico. */
export interface PlayerStats {
  townHallLevel: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  donations: number;
  donationsReceived: number;
  clanCapitalContributions: number;
  heroes: HeroLevels;
  builderHallLevel: number | null;
  builderBaseTrophies: number | null;
}

/** Cla ao qual o jogador pertencia no ultimo sync. */
export interface PlayerClanSummary {
  tag: string;
  name: string;
  role: string | null;
}

/** Resposta de GET /api/v1/players/me e /api/v1/players/:tag. */
export interface PlayerProfileResponse {
  id: string;
  playerTag: string;
  name: string;
  /** `null` enquanto a posse da conta nao for comprovada pelo API Token. */
  verifiedAt: string | null;
  townHallWeaponLevel: number | null;
  stats: PlayerStats;
  clan: PlayerClanSummary | null;
  playStyles: PlayStyle[];
  lastSyncedAt: string | null;
  /** `true` quando os dados vieram do cache, sem bater na Supercell. */
  fromCache: boolean;
}

/** Corpo de POST /api/v1/players/link. */
export interface LinkPlayerAccountRequest {
  /** Tag do jogador, com ou sem `#`. Normalizada no servidor. */
  playerTag: string;
  /**
   * API Token gerado no proprio jogo em
   * Configuracoes > Mais Configuracoes > API Token. Expira em minutos e e de
   * uso unico - e o que prova a posse da conta.
   */
  apiToken: string;
}

/**
 * Um ponto da serie temporal em GET /api/v1/players/me/history: as mesmas
 * metricas do perfil, mais quando foi capturado e em que cla o jogador estava.
 */
export interface PlayerStatsSnapshotResponse extends PlayerStats {
  capturedAt: string;
  clanTag: string | null;
}

export interface PlayerStatsHistoryResponse {
  playerTag: string;
  snapshots: PlayerStatsSnapshotResponse[];
}
