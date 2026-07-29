import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@clashscout/shared';

import { AppInfoPort, type AppInfo } from '../../core/application/ports/app-info.port';
import { AppConfigService } from '../config/app-config.service';

/** Manter em sincronia com a `version` de apps/api/package.json. */
const API_VERSION_TAG = '0.1.0';

/** Adapter: implementa a porta declarada pela camada de aplicacao. */
@Injectable()
export class AppInfoProvider extends AppInfoPort {
  constructor(private readonly config: AppConfigService) {
    super();
  }

  getInfo(): AppInfo {
    return {
      service: `${APP_NAME} API`,
      version: API_VERSION_TAG,
      environment: this.config.nodeEnv,
    };
  }

  getUptimeSeconds(): number {
    return Math.floor(process.uptime());
  }
}
