import type { ApplicationStatus } from '../enums/clash.enums';
import type { PlayerProfileResponse } from './player.contract';

/** Resumo da vaga embutido na candidatura, para a lista "minhas candidaturas". */
export interface ApplicationVacancySummary {
  id: string;
  title: string;
  clanTag: string;
  clanName: string;
  status: string;
}

/** Resposta de candidatura no ponto de vista do jogador (GET /applications/me). */
export interface ApplicationResponse {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
  vacancy: ApplicationVacancySummary;
}

/**
 * Resposta de candidatura no ponto de vista do lider (inbox de uma vaga):
 * inclui o perfil do candidato para comparacao lado a lado.
 */
export interface VacancyApplicationResponse {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
  candidate: PlayerProfileResponse;
}

/** Corpo de POST /api/v1/vacancies/:vacancyId/applications. */
export interface ApplyToVacancyRequest {
  message?: string;
}

/** Corpo de PATCH /api/v1/applications/:id/decision. */
export interface DecideApplicationRequest {
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
}
