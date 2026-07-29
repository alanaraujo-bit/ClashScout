import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { createPrismaClient, type PrismaClient } from '@clashscout/database';

import { AppConfigService } from '../config/app-config.service';

/**
 * Dono do ciclo de vida da conexao com o banco.
 *
 * Nenhuma outra classe instancia um PrismaClient: os repositorios recebem este
 * servico e usam `client`. Assim ha um unico pool de conexoes no processo, o que
 * importa em plataforma serverless/containers com limite de conexoes.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client: PrismaClient;

  constructor(config: AppConfigService) {
    const connectionString = config.databaseUrl;

    if (connectionString === undefined || connectionString.trim() === '') {
      // Falha no boot, e nao na primeira requisicao que tocar o banco.
      throw new Error(
        'DATABASE_URL nao configurada. Defina no .env local ou referencie ' +
          '${{Postgres.DATABASE_URL}} no servico do Railway.',
      );
    }

    this.client = createPrismaClient({
      connectionString,
      logQueries: !config.isProduction,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Conexao com o PostgreSQL estabelecida.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
