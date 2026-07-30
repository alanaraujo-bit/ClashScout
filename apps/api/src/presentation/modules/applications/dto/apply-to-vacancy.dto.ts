import type { ApplyToVacancyRequest } from '@clashscout/shared';
import { IsOptional, IsString, Length } from 'class-validator';

/** Entrada de POST /api/v1/vacancies/:vacancyId/applications. */
export class ApplyToVacancyDto implements ApplyToVacancyRequest {
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  message?: string;
}
