import { ApplicationStatus } from '@clashscout/shared';

import type { StoredApplication } from '../../../domain/entities/application.entity';
import {
  ApplicationNotFoundError,
  ApplicationVacancyNotOwnedError,
} from '../../../domain/errors/application.errors';
import type { ApplicationRepository } from '../../../domain/repositories/application.repository';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';
import type { WebPushPort } from '../../ports/web-push.port';

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
    private readonly profiles: PlayerProfileRepository,
    private readonly webPush: WebPushPort,
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

    const decided = await this.applications.decide(
      input.applicationId,
      input.status,
      input.ownerId,
    );

    const candidate = await this.profiles.findById(application.playerProfileId);
    if (candidate !== null) {
      const approved = input.status === ApplicationStatus.APPROVED;

      // Efeito colateral: nunca aguardado de forma bloqueante nem deixado
      // derrubar a decisao que acabou de ser gravada com sucesso.
      void this.webPush.sendToUser(candidate.userId, {
        title: approved ? 'Candidatura aprovada!' : 'Candidatura rejeitada',
        body: `Sua candidatura para "${vacancy.title}" foi ${approved ? 'aprovada' : 'rejeitada'}.`,
        url: '/applications',
        tag: `application-${decided.id}`,
      });
    }

    return decided;
  }
}
