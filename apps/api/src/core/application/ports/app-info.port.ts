export interface AppInfo {
  service: string;
  version: string;
  environment: string;
}

/**
 * Porta de saida (Dependency Inversion): a camada de aplicacao declara o que
 * precisa; a infraestrutura fornece a implementacao. Abstract class e usada
 * como token de injecao sem acoplar o core ao Nest.
 */
export abstract class AppInfoPort {
  abstract getInfo(): AppInfo;
  abstract getUptimeSeconds(): number;
}
