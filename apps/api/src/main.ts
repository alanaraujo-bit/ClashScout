import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { API_PREFIX, API_VERSION } from '@clashscout/shared';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config/app-config.service';
import { AllExceptionsFilter } from './presentation/http/filters/all-exceptions.filter';

/**
 * Composition root da aplicacao: e o unico lugar onde framework, configuracao
 * e camadas se encontram. Nenhuma regra de negocio mora aqui.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(AppConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION.replace('v', ''),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  // 0.0.0.0 e obrigatorio para o Railway conseguir rotear trafego ao container.
  await app.listen(config.port, '0.0.0.0');

  Logger.log(
    `ClashScout API [${config.nodeEnv}] em http://localhost:${config.port}/${API_PREFIX}/${API_VERSION}`,
    'Bootstrap',
  );
}

void bootstrap();
