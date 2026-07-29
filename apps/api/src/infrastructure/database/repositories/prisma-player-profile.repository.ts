import { Injectable } from '@nestjs/common';
import type { PlayerProfile, PlayerStatsHistory, Prisma } from '@clashscout/database';
import type { PlayStyle } from '@clashscout/shared';

import type {
  StoredPlayerProfile,
  StoredPlayerStatsSnapshot,
  SupercellPlayer,
} from '../../../core/domain/entities/player-profile.entity';
import {
  PlayerProfileRepository,
  type UpsertPlayerProfileInput,
} from '../../../core/domain/repositories/player-profile.repository';
import type { PlayerTag } from '../../../core/domain/value-objects/player-tag.vo';
import { PrismaService } from '../prisma.service';

/**
 * Implementacao Prisma do repositorio de perfis.
 *
 * Todo o conhecimento de colunas, upserts e mapeamento fica confinado aqui: as
 * camadas acima so conhecem `StoredPlayerProfile`.
 */
@Injectable()
export class PrismaPlayerProfileRepository extends PlayerProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: string): Promise<StoredPlayerProfile | null> {
    const row = await this.prisma.client.playerProfile.findUnique({ where: { userId } });

    return row === null ? null : toStoredProfile(row);
  }

  async findByPlayerTag(tag: PlayerTag): Promise<StoredPlayerProfile | null> {
    const row = await this.prisma.client.playerProfile.findUnique({
      where: { playerTag: tag.value },
    });

    return row === null ? null : toStoredProfile(row);
  }

  async upsertForUser(input: UpsertPlayerProfileInput): Promise<StoredPlayerProfile> {
    const data = toPersistenceFields(input.player, input.syncedAt);

    const row = await this.prisma.client.playerProfile.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        playerTag: input.player.tag,
        ...data,
        ...(input.verifiedAt === undefined ? {} : { verifiedAt: input.verifiedAt }),
        ...(input.playStyles === undefined ? {} : { playStyles: input.playStyles }),
      },
      update: {
        // `playerTag` fora do update de proposito: trocar de conta e um fluxo
        // proprio (desvincular e vincular de novo), nao efeito colateral de sync.
        ...data,
        ...(input.verifiedAt === undefined ? {} : { verifiedAt: input.verifiedAt }),
        ...(input.playStyles === undefined ? {} : { playStyles: input.playStyles }),
      },
    });

    return toStoredProfile(row);
  }

  async appendSnapshot(profileId: string, snapshot: StoredPlayerStatsSnapshot): Promise<void> {
    const { stats } = snapshot;

    const values = {
      townHallLevel: stats.townHallLevel,
      expLevel: stats.expLevel,
      trophies: stats.trophies,
      bestTrophies: stats.bestTrophies,
      warStars: stats.warStars,
      attackWins: stats.attackWins,
      defenseWins: stats.defenseWins,
      donations: stats.donations,
      donationsReceived: stats.donationsReceived,
      clanCapitalContributions: stats.clanCapitalContributions,
      barbarianKingLevel: stats.heroes.barbarianKing,
      archerQueenLevel: stats.heroes.archerQueen,
      minionPrinceLevel: stats.heroes.minionPrince,
      grandWardenLevel: stats.heroes.grandWarden,
      royalChampionLevel: stats.heroes.royalChampion,
      builderHallLevel: stats.builderHallLevel,
      builderBaseTrophies: stats.builderBaseTrophies,
      clanTag: snapshot.clanTag,
    } satisfies Omit<Prisma.PlayerStatsHistoryCreateInput, 'capturedAt' | 'profile'>;

    // Upsert na chave natural (perfil, instante): dois syncs no mesmo momento
    // nao geram dois pontos na serie.
    await this.prisma.client.playerStatsHistory.upsert({
      where: {
        playerProfileId_capturedAt: {
          playerProfileId: profileId,
          capturedAt: snapshot.capturedAt,
        },
      },
      create: {
        playerProfileId: profileId,
        capturedAt: snapshot.capturedAt,
        ...values,
      },
      update: values,
    });
  }

  async listHistory(profileId: string, limit: number): Promise<StoredPlayerStatsSnapshot[]> {
    const rows = await this.prisma.client.playerStatsHistory.findMany({
      where: { playerProfileId: profileId },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });

    return rows.map(toStoredSnapshot);
  }
}

/** Campos vindos da Supercell, prontos para create e update. */
function toPersistenceFields(player: SupercellPlayer, syncedAt: Date) {
  const { stats } = player;

  return {
    name: player.name,
    townHallLevel: stats.townHallLevel,
    townHallWeaponLevel: player.townHallWeaponLevel,
    expLevel: stats.expLevel,
    trophies: stats.trophies,
    bestTrophies: stats.bestTrophies,
    warStars: stats.warStars,
    attackWins: stats.attackWins,
    defenseWins: stats.defenseWins,
    donations: stats.donations,
    donationsReceived: stats.donationsReceived,
    clanCapitalContributions: stats.clanCapitalContributions,
    barbarianKingLevel: stats.heroes.barbarianKing,
    archerQueenLevel: stats.heroes.archerQueen,
    minionPrinceLevel: stats.heroes.minionPrince,
    grandWardenLevel: stats.heroes.grandWarden,
    royalChampionLevel: stats.heroes.royalChampion,
    builderHallLevel: stats.builderHallLevel,
    builderBaseTrophies: stats.builderBaseTrophies,
    clanTag: player.clan?.tag ?? null,
    clanName: player.clan?.name ?? null,
    clanRole: player.clan?.role ?? null,
    rawData: player.raw as Prisma.InputJsonValue,
    lastSyncedAt: syncedAt,
  };
}

function toStoredProfile(row: PlayerProfile): StoredPlayerProfile {
  return {
    id: row.id,
    userId: row.userId,
    playerTag: row.playerTag,
    name: row.name,
    verifiedAt: row.verifiedAt,
    townHallWeaponLevel: row.townHallWeaponLevel,
    stats: {
      townHallLevel: row.townHallLevel,
      expLevel: row.expLevel,
      trophies: row.trophies,
      bestTrophies: row.bestTrophies,
      warStars: row.warStars,
      attackWins: row.attackWins,
      defenseWins: row.defenseWins,
      donations: row.donations,
      donationsReceived: row.donationsReceived,
      clanCapitalContributions: row.clanCapitalContributions,
      heroes: {
        barbarianKing: row.barbarianKingLevel,
        archerQueen: row.archerQueenLevel,
        minionPrince: row.minionPrinceLevel,
        grandWarden: row.grandWardenLevel,
        royalChampion: row.royalChampionLevel,
      },
      builderHallLevel: row.builderHallLevel,
      builderBaseTrophies: row.builderBaseTrophies,
    },
    clan:
      row.clanTag === null || row.clanName === null
        ? null
        : { tag: row.clanTag, name: row.clanName, role: row.clanRole },
    // Os enums do Prisma e de @clashscout/shared tem exatamente os mesmos
    // valores; `prisma-enums.spec.ts` falha se divergirem.
    playStyles: row.playStyles as PlayStyle[],
    lastSyncedAt: row.lastSyncedAt,
  };
}

function toStoredSnapshot(row: PlayerStatsHistory): StoredPlayerStatsSnapshot {
  return {
    capturedAt: row.capturedAt,
    clanTag: row.clanTag,
    stats: {
      townHallLevel: row.townHallLevel,
      expLevel: row.expLevel,
      trophies: row.trophies,
      bestTrophies: row.bestTrophies,
      warStars: row.warStars,
      attackWins: row.attackWins,
      defenseWins: row.defenseWins,
      donations: row.donations,
      donationsReceived: row.donationsReceived,
      clanCapitalContributions: row.clanCapitalContributions,
      heroes: {
        barbarianKing: row.barbarianKingLevel,
        archerQueen: row.archerQueenLevel,
        minionPrince: row.minionPrinceLevel,
        grandWarden: row.grandWardenLevel,
        royalChampion: row.royalChampionLevel,
      },
      builderHallLevel: row.builderHallLevel,
      builderBaseTrophies: row.builderBaseTrophies,
    },
  };
}
