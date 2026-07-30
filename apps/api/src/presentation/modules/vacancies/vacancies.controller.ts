import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { VacancyListResponse, VacancyResponse } from '@clashscout/shared';

import { ChangeVacancyStatusUseCase } from '../../../core/application/use-cases/vacancies/change-vacancy-status.use-case';
import { CreateVacancyUseCase } from '../../../core/application/use-cases/vacancies/create-vacancy.use-case';
import { GetVacancyUseCase } from '../../../core/application/use-cases/vacancies/get-vacancy.use-case';
import { ListMyVacanciesUseCase } from '../../../core/application/use-cases/vacancies/list-my-vacancies.use-case';
import { ListOpenVacanciesUseCase } from '../../../core/application/use-cases/vacancies/list-open-vacancies.use-case';
import { UpdateVacancyUseCase } from '../../../core/application/use-cases/vacancies/update-vacancy.use-case';
import type { AuthenticatedUser } from '../../../core/domain/repositories/session.repository';
import { CurrentUser } from '../../http/decorators/current-user.decorator';
import { SessionGuard } from '../../http/guards/session.guard';
import { ChangeVacancyStatusDto } from './dto/change-vacancy-status.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyFeedQueryDto } from './dto/vacancy-feed-query.dto';
import { toVacancyResponse } from './vacancy.presenter';

/**
 * Rotas de vagas. `mine` precisa vir antes de `:id` na declaracao - senao o
 * Nest casaria `/vacancies/mine` com a rota parametrizada.
 */
@Controller({ path: 'vacancies', version: '1' })
@UseGuards(SessionGuard)
export class VacanciesController {
  constructor(
    private readonly createVacancy: CreateVacancyUseCase,
    private readonly updateVacancy: UpdateVacancyUseCase,
    private readonly changeStatus: ChangeVacancyStatusUseCase,
    private readonly getVacancy: GetVacancyUseCase,
    private readonly listMine: ListMyVacanciesUseCase,
    private readonly listOpen: ListOpenVacanciesUseCase,
  ) {}

  /** Cria uma vaga em DRAFT. Publicar e uma chamada separada a `:id/status`. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateVacancyDto,
  ): Promise<VacancyResponse> {
    const vacancy = await this.createVacancy.execute(user.id, {
      ...body,
      expiresAt: body.expiresAt === undefined ? null : new Date(body.expiresAt),
    });

    return toVacancyResponse(vacancy, null);
  }

  /** Vagas do usuario logado, qualquer status - o painel do lider. */
  @Get('mine')
  async mine(@CurrentUser() user: AuthenticatedUser): Promise<VacancyResponse[]> {
    const vacancies = await this.listMine.execute(user.id);

    return vacancies.map((vacancy) => toVacancyResponse(vacancy, null));
  }

  /** Feed publico de vagas abertas, paginado e filtravel. */
  @Get()
  async feed(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VacancyFeedQueryDto,
  ): Promise<VacancyListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const { items, total, viewerStats } = await this.listOpen.execute({
      viewerId: user.id,
      filters: {
        townHallLevel: query.townHallLevel,
        playStyles: query.playStyles,
        language: query.language,
      },
      pagination: { page, pageSize },
    });

    return {
      items: items.map((vacancy) => toVacancyResponse(vacancy, viewerStats)),
      page,
      pageSize,
      total,
      hasNext: page * pageSize < total,
    };
  }

  /** Detalhe de uma vaga. `matchesRequirements` usa o proprio perfil do jogador logado. */
  @Get(':id')
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<VacancyResponse> {
    const vacancy = await this.getVacancy.execute(id);

    return toVacancyResponse(vacancy, null);
  }

  /** Atualiza os campos de uma vaga. So o dono pode editar. */
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateVacancyDto,
  ): Promise<VacancyResponse> {
    const vacancy = await this.updateVacancy.execute({
      vacancyId: id,
      ownerId: user.id,
      changes: {
        ...body,
        expiresAt: body.expiresAt === undefined ? undefined : new Date(body.expiresAt),
      },
    });

    return toVacancyResponse(vacancy, null);
  }

  /** Publica, pausa ou fecha a vaga. So o dono pode mudar o status. */
  @Patch(':id/status')
  async changeVacancyStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: ChangeVacancyStatusDto,
  ): Promise<VacancyResponse> {
    const vacancy = await this.changeStatus.execute({
      vacancyId: id,
      ownerId: user.id,
      status: body.status,
    });

    return toVacancyResponse(vacancy, null);
  }
}
