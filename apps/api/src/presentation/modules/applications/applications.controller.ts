import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ApplicationResponse, VacancyApplicationResponse } from '@clashscout/shared';

import { ApplyToVacancyUseCase } from '../../../core/application/use-cases/applications/apply-to-vacancy.use-case';
import { DecideApplicationUseCase } from '../../../core/application/use-cases/applications/decide-application.use-case';
import { ListMyApplicationsUseCase } from '../../../core/application/use-cases/applications/list-my-applications.use-case';
import { ListVacancyApplicationsUseCase } from '../../../core/application/use-cases/applications/list-vacancy-applications.use-case';
import type { AuthenticatedUser } from '../../../core/domain/repositories/session.repository';
import { CurrentUser } from '../../http/decorators/current-user.decorator';
import { SessionGuard } from '../../http/guards/session.guard';
import { toApplicationResponse, toVacancyApplicationResponse } from './application.presenter';
import { ApplyToVacancyDto } from './dto/apply-to-vacancy.dto';
import { DecideApplicationDto } from './dto/decide-application.dto';

/**
 * Rotas de candidatura. Ficam sob dois prefixos (`vacancies/:vacancyId/...` e
 * `applications/...`) porque uma candidatura so faz sentido junto de uma vaga,
 * mas "minhas candidaturas" e "decidir uma candidatura" nao tem vaga no path.
 */
@Controller({ version: '1' })
@UseGuards(SessionGuard)
export class ApplicationsController {
  constructor(
    private readonly applyToVacancy: ApplyToVacancyUseCase,
    private readonly listMine: ListMyApplicationsUseCase,
    private readonly listForVacancy: ListVacancyApplicationsUseCase,
    private readonly decideApplication: DecideApplicationUseCase,
  ) {}

  /** Candidata o jogador logado a uma vaga aberta. */
  @Post('vacancies/:vacancyId/applications')
  @HttpCode(HttpStatus.CREATED)
  async apply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vacancyId') vacancyId: string,
    @Body() body: ApplyToVacancyDto,
  ): Promise<{ id: string }> {
    const application = await this.applyToVacancy.execute({
      userId: user.id,
      vacancyId,
      message: body.message,
    });

    return { id: application.id };
  }

  /** Candidaturas do jogador logado, com o resumo de cada vaga. */
  @Get('applications/me')
  async mine(@CurrentUser() user: AuthenticatedUser): Promise<ApplicationResponse[]> {
    const applications = await this.listMine.execute(user.id);

    return applications.map(toApplicationResponse);
  }

  /** Inbox do lider: candidaturas recebidas por uma vaga que ele possui. */
  @Get('vacancies/:vacancyId/applications')
  async forVacancy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vacancyId') vacancyId: string,
  ): Promise<VacancyApplicationResponse[]> {
    const applications = await this.listForVacancy.execute({ ownerId: user.id, vacancyId });

    return applications.map(toVacancyApplicationResponse);
  }

  /** Aprova ou rejeita uma candidatura. So o dono da vaga pode decidir. */
  @Patch('applications/:id/decision')
  async decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: DecideApplicationDto,
  ): Promise<{ id: string }> {
    const application = await this.decideApplication.execute({
      ownerId: user.id,
      applicationId: id,
      status: body.status,
    });

    return { id: application.id };
  }
}
