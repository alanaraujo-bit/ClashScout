import { PlayStyle } from '@clashscout/shared';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/** Query de GET /api/v1/vacancies. Filtros do feed de vagas do jogador. */
export class VacancyFeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(17)
  townHallLevel?: number;

  /** Aceita `?playStyles=WAR,CWL` - mais simples que repetir a chave na query. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter((entry) => entry !== '') : value,
  )
  @IsArray()
  @IsEnum(PlayStyle, { each: true })
  playStyles?: PlayStyle[];

  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
