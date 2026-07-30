import { Global, Module } from '@nestjs/common';

import { ApplicationRepository } from '../../core/domain/repositories/application.repository';
import { ClanVacancyRepository } from '../../core/domain/repositories/clan-vacancy.repository';
import { PlayerProfileRepository } from '../../core/domain/repositories/player-profile.repository';
import { SessionRepository } from '../../core/domain/repositories/session.repository';
import { PrismaApplicationRepository } from './repositories/prisma-application.repository';
import { PrismaClanVacancyRepository } from './repositories/prisma-clan-vacancy.repository';
import { PrismaPlayerProfileRepository } from './repositories/prisma-player-profile.repository';
import { PrismaSessionRepository } from './repositories/prisma-session.repository';
import { PrismaService } from './prisma.service';

/**
 * Amarra as interfaces de repositorio do dominio as implementacoes Prisma.
 *
 * Global porque praticamente todo modulo de feature precisa de repositorio, e
 * repetir o import em cada um seria ruido sem beneficio.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    { provide: PlayerProfileRepository, useClass: PrismaPlayerProfileRepository },
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: ClanVacancyRepository, useClass: PrismaClanVacancyRepository },
    { provide: ApplicationRepository, useClass: PrismaApplicationRepository },
  ],
  exports: [
    PrismaService,
    PlayerProfileRepository,
    SessionRepository,
    ClanVacancyRepository,
    ApplicationRepository,
  ],
})
export class DatabaseModule {}
