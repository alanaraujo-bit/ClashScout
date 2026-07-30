import type { StoredClanVacancy } from '../../../domain/entities/clan-vacancy.entity';
import { VacancyNotFoundError } from '../../../domain/errors/vacancy.errors';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

/** Le uma vaga pelo id, para a tela de detalhe. */
export class GetVacancyUseCase {
  constructor(private readonly vacancies: ClanVacancyRepository) {}

  async execute(vacancyId: string): Promise<StoredClanVacancy> {
    const vacancy = await this.vacancies.findById(vacancyId);

    if (vacancy === null) {
      throw new VacancyNotFoundError(vacancyId);
    }

    return vacancy;
  }
}
