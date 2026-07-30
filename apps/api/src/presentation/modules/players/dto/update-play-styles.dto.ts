import { PlayStyle } from '@clashscout/shared';
import { IsArray, IsEnum } from 'class-validator';

/** Entrada de PATCH /api/v1/players/me/play-styles. */
export class UpdatePlayStylesDto {
  @IsArray()
  @IsEnum(PlayStyle, { each: true })
  playStyles!: PlayStyle[];
}
