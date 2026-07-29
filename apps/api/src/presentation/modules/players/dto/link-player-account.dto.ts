import type { LinkPlayerAccountRequest } from '@clashscout/shared';
import { IsString, Length, Matches } from 'class-validator';

/**
 * Entrada de POST /api/v1/players/link.
 *
 * Valida forma, nao semantica: se a tag existe de fato e se o token confere e a
 * Supercell que diz. O `ValidationPipe` global roda com `forbidNonWhitelisted`,
 * portanto qualquer campo extra no corpo e rejeitado.
 */
export class LinkPlayerAccountDto implements LinkPlayerAccountRequest {
  /** Aceita com ou sem `#`; a normalizacao acontece no value object. */
  @IsString()
  @Matches(/^#?[0289PYLQGRJCUV]{3,12}$/i, {
    message: 'playerTag fora do formato de tag do Clash of Clans.',
  })
  playerTag!: string;

  /** API Token gerado no jogo. Formato nao documentado, so limitamos tamanho. */
  @IsString()
  @Length(6, 64)
  apiToken!: string;
}
