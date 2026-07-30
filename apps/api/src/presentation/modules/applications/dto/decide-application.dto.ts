import { ApplicationStatus, type DecideApplicationRequest } from '@clashscout/shared';
import { IsIn } from 'class-validator';

/** Entrada de PATCH /api/v1/applications/:id/decision. */
export class DecideApplicationDto implements DecideApplicationRequest {
  @IsIn([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED])
  status!: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
}
