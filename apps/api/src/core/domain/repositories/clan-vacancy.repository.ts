import type { PlayStyle } from '@clashscout/shared';

import type { ClanVacancyInput, StoredClanVacancy } from '../entities/clan-vacancy.entity';

export interface VacancyFeedFilters {
  townHallLevel?: number;
  playStyles?: PlayStyle[];
  language?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
}

/**
 * Contrato de persistencia de vagas.
 *
 * Interface declarada no dominio e implementada na infraestrutura (Prisma),
 * seguindo o mesmo padrao de `PlayerProfileRepository`.
 */
export abstract class ClanVacancyRepository {
  abstract create(ownerId: string, input: ClanVacancyInput): Promise<StoredClanVacancy>;

  abstract update(id: string, input: Partial<ClanVacancyInput>): Promise<StoredClanVacancy>;

  abstract updateStatus(id: string, status: string): Promise<StoredClanVacancy>;

  abstract findById(id: string): Promise<StoredClanVacancy | null>;

  /** Vagas publicadas (status OPEN), paginadas e filtraveis - o feed do jogador. */
  abstract listOpen(
    filters: VacancyFeedFilters,
    pagination: Pagination,
  ): Promise<PagedResult<StoredClanVacancy>>;

  /** Todas as vagas de um dono, independente do status - o painel do lider. */
  abstract listByOwner(ownerId: string): Promise<StoredClanVacancy[]>;
}
