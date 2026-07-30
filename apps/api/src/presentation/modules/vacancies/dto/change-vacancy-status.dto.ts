import type { ChangeVacancyStatusRequest } from '@clashscout/shared';
import { VacancyStatus } from '@clashscout/shared';
import { IsEnum } from 'class-validator';

/** Entrada de PATCH /api/v1/vacancies/:id/status. */
export class ChangeVacancyStatusDto implements ChangeVacancyStatusRequest {
  @IsEnum(VacancyStatus)
  status!: VacancyStatus;
}
