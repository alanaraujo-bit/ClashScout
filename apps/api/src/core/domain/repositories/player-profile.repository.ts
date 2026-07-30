import type { PlayStyle } from '@clashscout/shared';

import type { PlayerTag } from '../value-objects/player-tag.vo';
import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
  SupercellPlayer,
} from '../entities/player-profile.entity';

export interface UpsertPlayerProfileInput {
  userId: string;
  player: SupercellPlayer;
  /** Preenchido apenas no fluxo de vinculacao, quando a posse foi comprovada. */
  verifiedAt?: Date;
  playStyles?: PlayStyle[];
  syncedAt: Date;
}

/**
 * Contrato de persistencia do perfil de jogador.
 *
 * Interface declarada no dominio e implementada na infraestrutura (Prisma):
 * o dominio dita o que precisa, a infraestrutura obedece. Trocar o ORM nao
 * toca em nada acima desta linha.
 */
export abstract class PlayerProfileRepository {
  abstract findByUserId(userId: string): Promise<StoredPlayerProfile | null>;

  abstract findByPlayerTag(tag: PlayerTag): Promise<StoredPlayerProfile | null>;

  /** Cria ou atualiza o perfil do usuario a partir de uma leitura da Supercell. */
  abstract upsertForUser(input: UpsertPlayerProfileInput): Promise<StoredPlayerProfile>;

  /**
   * Grava um snapshot na serie historica. Idempotente por (perfil, capturedAt):
   * dois syncs no mesmo instante nao devem gerar dois pontos.
   */
  abstract appendSnapshot(profileId: string, snapshot: StoredPlayerStatsSnapshot): Promise<void>;

  abstract listHistory(profileId: string, limit: number): Promise<StoredPlayerStatsSnapshot[]>;

  /** Estilos de jogo declarados pelo proprio jogador - usados no matching de vagas. */
  abstract updatePlayStyles(
    profileId: string,
    playStyles: PlayStyle[],
  ): Promise<StoredPlayerProfile>;
}
