import { Injectable } from '@nestjs/common';
import type { Application, PlayerProfile } from '@clashscout/database';
import { ApplicationStatus } from '@clashscout/shared';

import type {
  StoredApplication,
  StoredApplicationWithCandidate,
  StoredApplicationWithVacancy,
} from '../../../core/domain/entities/application.entity';
import {
  ApplicationRepository,
  type UpsertApplicationInput,
} from '../../../core/domain/repositories/application.repository';
import { PrismaService } from '../prisma.service';
import { toStoredProfile } from './prisma-player-profile.repository';

const REOPENABLE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

/**
 * Implementacao Prisma do repositorio de candidaturas.
 *
 * `upsertPending` usa a chave unica (vaga, perfil): a primeira candidatura cria
 * a linha, uma reaplicacao depois de REJECTED/WITHDRAWN reabre a mesma linha
 * como PENDING. `ApplyToVacancyUseCase` ja bloqueou o caso de status ativo
 * antes de chegar aqui.
 */
@Injectable()
export class PrismaApplicationRepository extends ApplicationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByVacancyAndProfile(
    vacancyId: string,
    playerProfileId: string,
  ): Promise<StoredApplication | null> {
    const row = await this.prisma.client.application.findUnique({
      where: { vacancyId_playerProfileId: { vacancyId, playerProfileId } },
    });

    return row === null ? null : toStoredApplication(row);
  }

  async findById(id: string): Promise<StoredApplication | null> {
    const row = await this.prisma.client.application.findUnique({ where: { id } });

    return row === null ? null : toStoredApplication(row);
  }

  async upsertPending(input: UpsertApplicationInput): Promise<StoredApplication> {
    const row = await this.prisma.client.application.upsert({
      where: {
        vacancyId_playerProfileId: {
          vacancyId: input.vacancyId,
          playerProfileId: input.playerProfileId,
        },
      },
      create: {
        vacancyId: input.vacancyId,
        playerProfileId: input.playerProfileId,
        message: input.message,
        status: ApplicationStatus.PENDING,
      },
      update: {
        status: ApplicationStatus.PENDING,
        message: input.message,
        decidedAt: null,
        decidedBy: null,
      },
    });

    return toStoredApplication(row);
  }

  async decide(
    id: string,
    status: ApplicationStatus,
    decidedBy: string,
  ): Promise<StoredApplication> {
    const row = await this.prisma.client.application.update({
      where: { id },
      data: { status, decidedAt: new Date(), decidedBy },
    });

    return toStoredApplication(row);
  }

  async listByPlayerProfile(playerProfileId: string): Promise<StoredApplicationWithVacancy[]> {
    const rows = await this.prisma.client.application.findMany({
      where: { playerProfileId },
      orderBy: { createdAt: 'desc' },
      include: { vacancy: true },
    });

    return rows.map((row) => ({
      ...toStoredApplication(row),
      vacancy: {
        id: row.vacancy.id,
        title: row.vacancy.title,
        clanTag: row.vacancy.clanTag,
        clanName: row.vacancy.clanName,
        status: row.vacancy.status,
      },
    }));
  }

  async listByVacancy(vacancyId: string): Promise<StoredApplicationWithCandidate[]> {
    const rows = await this.prisma.client.application.findMany({
      where: { vacancyId },
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    });

    return rows.map((row) => ({
      ...toStoredApplication(row),
      candidate: toStoredProfile(row.profile as PlayerProfile),
    }));
  }
}

function toStoredApplication(row: Application): StoredApplication {
  return {
    id: row.id,
    vacancyId: row.vacancyId,
    playerProfileId: row.playerProfileId,
    // Os enums do Prisma e de @clashscout/shared tem exatamente os mesmos
    // valores; `prisma-enums.spec.ts` falha se divergirem.
    status: row.status as ApplicationStatus,
    message: row.message,
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
    decidedBy: row.decidedBy,
  };
}
