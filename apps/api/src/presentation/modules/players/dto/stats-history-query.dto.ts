import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** Query de GET /api/v1/players/me/history. */
export class StatsHistoryQueryDto {
  /** Quantidade de snapshots, do mais recente para o mais antigo. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  limit?: number;
}
