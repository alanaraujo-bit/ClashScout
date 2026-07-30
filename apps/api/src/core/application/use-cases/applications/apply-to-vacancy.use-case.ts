import { ApplicationStatus } from '@clashscout/shared';

import type { StoredApplication } from '../../../domain/entities/application.entity';
import {
  DuplicateApplicationError,
  PlayerNotVerifiedError,
} from '../../../domain/errors/application.errors';
import { VacancyNotFoundError } from '../../../domain/errors/vacancy.errors';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import { VacancyNotOpenError } from '../../../domain/errors/application.errors';
import type { ApplicationRepository } from '../../../domain/repositories/application.repository';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';
import type { WebPushPort } from '../../ports/web-push.port';

export interface ApplyToVacancyInput {
  userId: string;
  vacancyId: string;
  message?: string;
}

const ACTIVE_STATUSES = new Set<ApplicationStatus>([
  ApplicationStatus.PENDING,
  ApplicationStatus.REVIEWING,
  ApplicationStatus.APPROVED,
]);

/**
 * Candidata o jogador logado a uma vaga aberta.
 *
 * Reaplicar depois de REJECTED/WITHDRAWN reabre a mesma linha como PENDING em
 * vez de criar uma segunda candidatura - por isso o check de duplicidade olha
 * o status atual, nao so a existencia da linha.
 */
export class ApplyToVacancyUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly vacancies: ClanVacancyRepository,
    private readonly profiles: PlayerProfileRepository,
    private readonly webPush: WebPushPort,
  ) {}

  async execute(input: ApplyToVacancyInput): Promise<StoredApplication> {
    const vacancy = await this.vacancies.findById(input.vacancyId);
    if (vacancy === null) {
      throw new VacancyNotFoundError(input.vacancyId);
    }
    if (vacancy.status !== 'OPEN') {
      throw new VacancyNotOpenError();
    }

    const profile = await this.profiles.findByUserId(input.userId);
    if (profile === null) {
      throw new PlayerProfileNotFoundError();
    }
    if (profile.verifiedAt === null) {
      throw new PlayerNotVerifiedError();
    }

    const existing = await this.applications.findByVacancyAndProfile(input.vacancyId, profile.id);
    if (existing !== null && ACTIVE_STATUSES.has(existing.status)) {
      throw new DuplicateApplicationError();
    }

    const application = await this.applications.upsertPending({
      vacancyId: input.vacancyId,
      playerProfileId: profile.id,
      message: input.message ?? null,
    });

    // Efeito colateral: nunca aguardado de forma bloqueante nem deixado
    // derrubar a candidatura que acabou de ser criada com sucesso.
    void this.webPush.sendToUser(vacancy.ownerId, {
      title: 'Nova candidatura',
      body: `${profile.name} se candidatou para "${vacancy.title}".`,
      url: `/leader/vacancies/${vacancy.id}/applications`,
      tag: `vacancy-${vacancy.id}-applications`,
    });

    return application;
  }
}
