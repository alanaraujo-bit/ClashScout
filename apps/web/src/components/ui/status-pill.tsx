import { ApplicationStatus, VacancyStatus } from '@clashscout/shared';

import { Badge } from './badge';

const VACANCY_STATUS_LABEL: Record<VacancyStatus, string> = {
  [VacancyStatus.DRAFT]: 'Rascunho',
  [VacancyStatus.OPEN]: 'Aberta',
  [VacancyStatus.PAUSED]: 'Pausada',
  [VacancyStatus.CLOSED]: 'Encerrada',
};

const VACANCY_STATUS_TONE: Record<
  VacancyStatus,
  'neutral' | 'accent' | 'success' | 'warning' | 'danger'
> = {
  [VacancyStatus.DRAFT]: 'neutral',
  [VacancyStatus.OPEN]: 'success',
  [VacancyStatus.PAUSED]: 'warning',
  [VacancyStatus.CLOSED]: 'danger',
};

export function VacancyStatusPill({ status }: { status: VacancyStatus }) {
  return <Badge tone={VACANCY_STATUS_TONE[status]}>{VACANCY_STATUS_LABEL[status]}</Badge>;
}

const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Em analise',
  [ApplicationStatus.REVIEWING]: 'Em avaliacao',
  [ApplicationStatus.APPROVED]: 'Aprovada',
  [ApplicationStatus.REJECTED]: 'Rejeitada',
  [ApplicationStatus.WITHDRAWN]: 'Retirada',
};

const APPLICATION_STATUS_TONE: Record<
  ApplicationStatus,
  'neutral' | 'accent' | 'success' | 'warning' | 'danger'
> = {
  [ApplicationStatus.PENDING]: 'warning',
  [ApplicationStatus.REVIEWING]: 'accent',
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.REJECTED]: 'danger',
  [ApplicationStatus.WITHDRAWN]: 'neutral',
};

export function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  return <Badge tone={APPLICATION_STATUS_TONE[status]}>{APPLICATION_STATUS_LABEL[status]}</Badge>;
}
