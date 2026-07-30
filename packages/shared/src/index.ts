/**
 * Ponto unico de exportacao do pacote compartilhado.
 * Regra: este pacote NAO pode importar nada de `apps/`. Ele e a base da piramide
 * de dependencias (web -> shared, api -> shared).
 */
export * from './constants/app.constants';
export * from './contracts/api-response.contract';
export * from './contracts/application.contract';
export * from './contracts/health.contract';
export * from './contracts/player.contract';
export * from './contracts/vacancy.contract';
export * from './enums/clash.enums';
export * from './utils/player-tag.util';
export * from './utils/vacancy-matching.util';
