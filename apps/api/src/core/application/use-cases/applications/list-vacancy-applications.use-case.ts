import type { StoredApplicationWithCandidate } from '../../../domain/entities/application.entity';
import { ApplicationVacancyNotOwnedError } from '../../../domain/errors/application.errors';
import { VacancyNotFoundError } from '../../../domain/errors/vacancy.errors';
import type { ApplicationRepository } from '../../../domain/repositories/application.repository';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

export interface ListVacancyApplicationsInput {
  ownerId: string;
  vacancyId: string;
}

/** Inbox do lider: candidaturas recebidas por uma vaga que ele possui. */
export class ListVacancyApplicationsUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly vacancies: ClanVacancyRepository,
  ) {}

  async execute(input: ListVacancyApplicationsInput): Promise<StoredApplicationWithCandidate[]> {
    const vacancy = await this.vacancies.findById(input.vacancyId);

    if (vacancy === null) {
      throw new VacancyNotFoundError(input.vacancyId);
    }

    if (vacancy.ownerId !== input.ownerId) {
      throw new ApplicationVacancyNotOwnedError();
    }

    return this.applications.listByVacancy(input.vacancyId);
  }
}
