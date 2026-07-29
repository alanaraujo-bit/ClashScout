/**
 * Envelope padrao de erro da API. Todo erro tratado pelo filtro global
 * da camada de apresentacao responde neste formato.
 */
export interface ApiErrorResponse {
  statusCode: number;
  /** Codigo estavel para o frontend tratar (ex.: PLAYER_TAG_INVALID). */
  code: string;
  message: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

/** Envelope de listagens paginadas. */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}
