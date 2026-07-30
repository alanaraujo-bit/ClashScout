import type { PlayStyle, VacancyStatus } from '@clashscout/shared';

/** Vaga como esta persistida no nosso banco. */
export interface StoredClanVacancy {
  id: string;
  ownerId: string;
  clanTag: string;
  clanName: string;
  title: string;
  description: string;
  status: VacancyStatus;

  minTownHallLevel: number | null;
  minTrophies: number | null;
  minWarStars: number | null;
  minBarbarianKingLevel: number | null;
  minArcherQueenLevel: number | null;
  minMinionPrinceLevel: number | null;
  minGrandWardenLevel: number | null;
  minRoyalChampionLevel: number | null;

  playStyles: PlayStyle[];
  language: string | null;
  bannerUrl: string | null;
  expiresAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  /** Quantidade de candidaturas recebidas. `null` quando o repositorio nao carregou a contagem. */
  applicationsCount: number | null;
}

/** Campos aceitos na criacao/edicao de uma vaga. */
export interface ClanVacancyInput {
  clanTag: string;
  clanName: string;
  title: string;
  description: string;
  minTownHallLevel?: number | null;
  minTrophies?: number | null;
  minWarStars?: number | null;
  minBarbarianKingLevel?: number | null;
  minArcherQueenLevel?: number | null;
  minMinionPrinceLevel?: number | null;
  minGrandWardenLevel?: number | null;
  minRoyalChampionLevel?: number | null;
  playStyles?: PlayStyle[];
  language?: string | null;
  expiresAt?: Date | null;
}
