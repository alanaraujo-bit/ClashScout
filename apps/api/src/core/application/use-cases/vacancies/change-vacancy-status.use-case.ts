import type { VacancyStatus } from '@clashscout/shared';

import type { StoredClanVacancy } from '../../../domain/entities/clan-vacancy.entity';
import { VacancyNotFoundError, VacancyNotOwnedError } from '../../../domain/errors/vacancy.errors';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

export interface ChangeVacancyStatusInput {
  vacancyId: string;
  ownerId: string;
  status: VacancyStatus;
}

/**
 * Muda o status de uma vaga (publicar, pausar, fechar). So o dono pode fazer isso.
 *
 * Sem maquina de estados: qualquer transicao entre DRAFT/OPEN/PAUSED/CLOSED e
 * permitida - o lider e quem decide o ciclo de vida da propria vaga.
 */
export class ChangeVacancyStatusUseCase {
  constructor(private readonly vacancies: ClanVacancyRepository) {}

  async execute(input: ChangeVacancyStatusInput): Promise<StoredClanVacancy> {
    const vacancy = await this.vacancies.findById(input.vacancyId);

    if (vacancy === null) {
      throw new VacancyNotFoundError(input.vacancyId);
    }

    if (vacancy.ownerId !== input.ownerId) {
      throw new VacancyNotOwnedError();
    }

    return this.vacancies.updateStatus(input.vacancyId, input.status);
  }
}
