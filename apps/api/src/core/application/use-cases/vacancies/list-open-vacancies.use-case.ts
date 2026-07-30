import type { StoredClanVacancy } from '../../../domain/entities/clan-vacancy.entity';
import type {
  Pagination,
  ClanVacancyRepository,
  VacancyFeedFilters,
} from '../../../domain/repositories/clan-vacancy.repository';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';

export interface ListOpenVacanciesInput {
  /** Usuario logado, para calcular `matchesRequirements` contra o proprio perfil. */
  viewerId: string;
  filters: VacancyFeedFilters;
  pagination: Pagination;
}

export interface OpenVacanciesResult {
  items: StoredClanVacancy[];
  total: number;
  /** `null` quando o usuario logado ainda nao tem perfil vinculado. */
  viewerStats: Awaited<ReturnType<PlayerProfileRepository['findByUserId']>>;
}

/** Feed publico de vagas abertas - o que o jogador navega para procurar cla. */
export class ListOpenVacanciesUseCase {
  constructor(
    private readonly vacancies: ClanVacancyRepository,
    private readonly profiles: PlayerProfileRepository,
  ) {}

  async execute(input: ListOpenVacanciesInput): Promise<OpenVacanciesResult> {
    const [{ items, total }, viewerStats] = await Promise.all([
      this.vacancies.listOpen(input.filters, input.pagination),
      this.profiles.findByUserId(input.viewerId),
    ]);

    return { items, total, viewerStats };
  }
}
