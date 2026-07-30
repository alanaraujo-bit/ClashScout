import { ApplicationStatus } from '@clashscout/shared';

import type { StoredApplication } from '../../../domain/entities/application.entity';
import {
  ApplicationNotFoundError,
  ApplicationVacancyNotOwnedError,
} from '../../../domain/errors/application.errors';
import type { ApplicationRepository } from '../../../domain/repositories/application.repository';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

export interface DecideApplicationInput {
  ownerId: string;
  applicationId: string;
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
}

/** Aprova ou rejeita uma candidatura. So o dono da vaga pode decidir. */
export class DecideApplicationUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly vacancies: ClanVacancyRepository,
  ) {}

  async execute(input: DecideApplicationInput): Promise<StoredApplication> {
    const application = await this.applications.findById(input.applicationId);

    if (application === null) {
      throw new ApplicationNotFoundError(input.applicationId);
    }

    const vacancy = await this.vacancies.findById(application.vacancyId);

    if (vacancy === null || vacancy.ownerId !== input.ownerId) {
      throw new ApplicationVacancyNotOwnedError();
    }

    return this.applications.decide(input.applicationId, input.status, input.ownerId);
  }
}
