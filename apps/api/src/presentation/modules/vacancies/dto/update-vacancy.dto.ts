import type { UpdateVacancyRequest } from '@clashscout/shared';
import { PlayStyle } from '@clashscout/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

/** Entrada de PATCH /api/v1/vacancies/:id. Todos os campos sao opcionais. */
export class UpdateVacancyDto implements UpdateVacancyRequest {
  @IsOptional()
  @IsString()
  @Matches(/^#?[0289PYLQGRJCUV]{3,12}$/i, {
    message: 'clanTag fora do formato de tag do Clash of Clans.',
  })
  clanTag?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  clanName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(10, 4000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(17)
  minTownHallLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minTrophies?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minWarStars?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minBarbarianKingLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minArcherQueenLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minMinionPrinceLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minGrandWardenLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minRoyalChampionLevel?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PlayStyle, { each: true })
  playStyles?: PlayStyle[];

  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
