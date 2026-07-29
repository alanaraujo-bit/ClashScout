export type HealthStatus = 'ok' | 'degraded' | 'down';

/** Resposta de GET /api/v1/health - usada por Railway e pelo frontend. */
export interface HealthCheckResponse {
  status: HealthStatus;
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}
