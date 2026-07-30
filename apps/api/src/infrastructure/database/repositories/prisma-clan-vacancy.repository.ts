import { Injectable } from '@nestjs/common';
import type { ClanVacancy, Prisma } from '@clashscout/database';
import type { PlayStyle, VacancyStatus } from '@clashscout/shared';

import type {
  ClanVacancyInput,
  StoredClanVacancy,
} from '../../../core/domain/entities/clan-vacancy.entity';
import {
  ClanVacancyRepository,
  type PagedResult,
  type Pagination,
  type VacancyFeedFilters,
} from '../../../core/domain/repositories/clan-vacancy.repository';
import { PrismaService } from '../prisma.service';

type ClanVacancyWithCount = ClanVacancy & { _count?: { applications: number } };

/**
 * Implementacao Prisma do repositorio de vagas.
 *
 * Mesma divisao de responsabilidade de `PrismaPlayerProfileRepository`: aqui
 * moram colunas e mapeamento, acima so `StoredClanVacancy`.
 */
@Injectable()
export class PrismaClanVacancyRepository extends ClanVacancyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(ownerId: string, input: ClanVacancyInput): Promise<StoredClanVacancy> {
    const row = await this.prisma.client.clanVacancy.create({
      data: {
        ownerId,
        clanTag: input.clanTag,
        clanName: input.clanName,
        title: input.title,
        description: input.description,
        ...toPersistenceFields(input),
      },
    });

    return toStoredVacancy(row);
  }

  async update(id: string, input: Partial<ClanVacancyInput>): Promise<StoredClanVacancy> {
    const row = await this.prisma.client.clanVacancy.update({
      where: { id },
      data: {
        ...(input.clanTag === undefined ? {} : { clanTag: input.clanTag }),
        ...(input.clanName === undefined ? {} : { clanName: input.clanName }),
        ...(input.title === undefined ? {} : { title: input.title }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...toPersistenceFields(input),
      },
    });

    return toStoredVacancy(row);
  }

  async updateStatus(id: string, status: string): Promise<StoredClanVacancy> {
    const row = await this.prisma.client.clanVacancy.update({
      where: { id },
      data: { status: status as VacancyStatus },
    });

    return toStoredVacancy(row);
  }

  async findById(id: string): Promise<StoredClanVacancy | null> {
    const row = await this.prisma.client.clanVacancy.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });

    return row === null ? null : toStoredVacancy(row);
  }

  async listOpen(
    filters: VacancyFeedFilters,
    pagination: Pagination,
  ): Promise<PagedResult<StoredClanVacancy>> {
    const where: Prisma.ClanVacancyWhereInput = {
      status: 'OPEN',
      ...(filters.townHallLevel === undefined
        ? {}
        : {
            OR: [{ minTownHallLevel: null }, { minTownHallLevel: { lte: filters.townHallLevel } }],
          }),
      ...(filters.language === undefined ? {} : { language: filters.language }),
      ...(filters.playStyles === undefined || filters.playStyles.length === 0
        ? {}
        : { playStyles: { hasSome: filters.playStyles } }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.client.clanVacancy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.client.clanVacancy.count({ where }),
    ]);

    return { items: rows.map(toStoredVacancy), total };
  }

  async listByOwner(ownerId: string): Promise<StoredClanVacancy[]> {
    const rows = await this.prisma.client.clanVacancy.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });

    return rows.map(toStoredVacancy);
  }
}

interface OptionalVacancyFields {
  minTownHallLevel?: number | null;
  minTrophies?: number | null;
  minWarStars?: number | null;
  minBarbarianKingLevel?: number | null;
  minArcherQueenLevel?: number | null;
  minMinionPrinceLevel?: number | null;
  minGrandWardenLevel?: number | null;
  minRoyalChampionLevel?: number | null;
  playStyles?: PlayStyle[];
  language?: string | null;
  expiresAt?: Date | null;
}

/** Campos opcionais (requisitos, playstyles, etc). Os obrigatorios sao montados por quem chama. */
function toPersistenceFields(input: Partial<ClanVacancyInput>): OptionalVacancyFields {
  return {
    ...(input.minTownHallLevel === undefined ? {} : { minTownHallLevel: input.minTownHallLevel }),
    ...(input.minTrophies === undefined ? {} : { minTrophies: input.minTrophies }),
    ...(input.minWarStars === undefined ? {} : { minWarStars: input.minWarStars }),
    ...(input.minBarbarianKingLevel === undefined
      ? {}
      : { minBarbarianKingLevel: input.minBarbarianKingLevel }),
    ...(input.minArcherQueenLevel === undefined
      ? {}
      : { minArcherQueenLevel: input.minArcherQueenLevel }),
    ...(input.minMinionPrinceLevel === undefined
      ? {}
      : { minMinionPrinceLevel: input.minMinionPrinceLevel }),
    ...(input.minGrandWardenLevel === undefined
      ? {}
      : { minGrandWardenLevel: input.minGrandWardenLevel }),
    ...(input.minRoyalChampionLevel === undefined
      ? {}
      : { minRoyalChampionLevel: input.minRoyalChampionLevel }),
    ...(input.playStyles === undefined ? {} : { playStyles: input.playStyles }),
    ...(input.language === undefined ? {} : { language: input.language }),
    ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
  };
}

function toStoredVacancy(row: ClanVacancyWithCount): StoredClanVacancy {
  return {
    id: row.id,
    ownerId: row.ownerId,
    clanTag: row.clanTag,
    clanName: row.clanName,
    title: row.title,
    description: row.description,
    // Os enums do Prisma e de @clashscout/shared tem exatamente os mesmos
    // valores; `prisma-enums.spec.ts` falha se divergirem.
    status: row.status as VacancyStatus,
    minTownHallLevel: row.minTownHallLevel,
    minTrophies: row.minTrophies,
    minWarStars: row.minWarStars,
    minBarbarianKingLevel: row.minBarbarianKingLevel,
    minArcherQueenLevel: row.minArcherQueenLevel,
    minMinionPrinceLevel: row.minMinionPrinceLevel,
    minGrandWardenLevel: row.minGrandWardenLevel,
    minRoyalChampionLevel: row.minRoyalChampionLevel,
    // Os enums do Prisma e de @clashscout/shared tem exatamente os mesmos
    // valores; `prisma-enums.spec.ts` falha se divergirem.
    playStyles: row.playStyles as PlayStyle[],
    language: row.language,
    bannerUrl: row.bannerUrl,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    applicationsCount: row._count?.applications ?? null,
  };
}
