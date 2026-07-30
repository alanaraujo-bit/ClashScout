import type { PlayStyle, VacancyStatus } from '../enums/clash.enums';

/** Requisitos minimos de uma vaga. `null`/ausente = requisito nao exigido. */
export interface VacancyRequirements {
  minTownHallLevel: number | null;
  minTrophies: number | null;
  minWarStars: number | null;
  minBarbarianKingLevel: number | null;
  minArcherQueenLevel: number | null;
  minMinionPrinceLevel: number | null;
  minGrandWardenLevel: number | null;
  minRoyalChampionLevel: number | null;
}

/** Resposta de vaga, usada no feed, no detalhe e no painel do lider. */
export interface VacancyResponse extends VacancyRequirements {
  id: string;
  ownerId: string;
  clanTag: string;
  clanName: string;
  title: string;
  description: string;
  status: VacancyStatus;
  playStyles: PlayStyle[];
  language: string | null;
  bannerUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * `true` quando o perfil do jogador logado atende a todos os requisitos.
   * `null` quando o jogador ainda nao vinculou/verificou uma conta.
   */
  matchesRequirements: boolean | null;
  /** Quantidade de candidaturas recebidas. So preenchido para o dono da vaga. */
  applicationsCount: number | null;
}

export interface VacancyListResponse {
  items: VacancyResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}

/** Corpo de POST /api/v1/vacancies. */
export interface CreateVacancyRequest extends Partial<VacancyRequirements> {
  clanTag: string;
  clanName: string;
  title: string;
  description: string;
  playStyles?: PlayStyle[];
  language?: string | null;
  expiresAt?: string | null;
}

/** Corpo de PATCH /api/v1/vacancies/:id. Todos os campos sao opcionais. */
export type UpdateVacancyRequest = Partial<CreateVacancyRequest>;

/** Corpo de PATCH /api/v1/vacancies/:id/status. */
export interface ChangeVacancyStatusRequest {
  status: VacancyStatus;
}

/** Query de GET /api/v1/vacancies (feed publico, paginado e filtravel). */
export interface VacancyFeedQuery {
  townHallLevel?: number;
  playStyles?: PlayStyle[];
  language?: string;
  page?: number;
  pageSize?: number;
}
