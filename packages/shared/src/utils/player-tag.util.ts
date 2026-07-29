/**
 * Regras de formato da Player Tag da Supercell.
 * Tags usam um alfabeto restrito (sem O, I, S, etc.) e sao sempre maiusculas.
 * A verificacao real contra a API oficial acontece na Fase 2.
 */
const TAG_ALPHABET = '0289PYLQGRJCUV';
const TAG_PATTERN = new RegExp(`^#[${TAG_ALPHABET}]{3,12}$`);

/** Normaliza entrada do usuario: remove espacos, forca maiuscula e garante o `#`. */
export function normalizePlayerTag(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '').replace(/^#+/, '');
  return `#${cleaned}`;
}

/** Valida o formato (nao a existencia) de uma tag ja normalizada. */
export function isValidPlayerTag(raw: string): boolean {
  return TAG_PATTERN.test(normalizePlayerTag(raw));
}

/** Codifica a tag para uso em URL da API da Supercell (`#` vira `%23`). */
export function encodePlayerTagForApi(raw: string): string {
  return encodeURIComponent(normalizePlayerTag(raw));
}
