import type { StoredPlayerProfile } from '../../../domain/entities/player-profile.entity';
import {
  PlayerTagAlreadyLinkedError,
  PlayerTokenVerificationFailedError,
} from '../../../domain/errors/player.errors';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';
import { PlayerTag } from '../../../domain/value-objects/player-tag.vo';
import type { SupercellGatewayPort } from '../../ports/supercell-gateway.port';

export interface LinkPlayerAccountInput {
  userId: string;
  playerTag: string;
  apiToken: string;
}

/**
 * Vincula uma conta do Clash of Clans ao usuario logado, comprovando a posse
 * pelo API Token gerado dentro do jogo.
 *
 * Ordem das verificacoes e intencional: checamos se a tag ja pertence a outra
 * pessoa ANTES de gastar a chamada de verificacao na Supercell, porque o token
 * do jogador e de uso unico e queima ao ser validado.
 */
export class LinkPlayerAccountUseCase {
  constructor(
    private readonly profiles: PlayerProfileRepository,
    private readonly supercell: SupercellGatewayPort,
  ) {}

  async execute(input: LinkPlayerAccountInput): Promise<StoredPlayerProfile> {
    const tag = PlayerTag.create(input.playerTag);

    const existing = await this.profiles.findByPlayerTag(tag);
    if (existing !== null && existing.userId !== input.userId) {
      throw new PlayerTagAlreadyLinkedError(tag.value);
    }

    const isOwner = await this.supercell.verifyPlayerToken(tag, input.apiToken);
    if (!isOwner) {
      throw new PlayerTokenVerificationFailedError(tag.value);
    }

    // Vinculo recem-comprovado: buscamos direto na origem, sem cache, para o
    // perfil nascer com dados do momento da verificacao.
    const { player } = await this.supercell.fetchPlayer(tag, true);
    const syncedAt = new Date();

    const profile = await this.profiles.upsertForUser({
      userId: input.userId,
      player,
      verifiedAt: syncedAt,
      syncedAt,
    });

    await this.profiles.appendSnapshot(profile.id, {
      capturedAt: syncedAt,
      clanTag: player.clan?.tag ?? null,
      stats: player.stats,
    });

    return profile;
  }
}
