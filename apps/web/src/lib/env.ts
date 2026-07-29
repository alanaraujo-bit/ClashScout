/**
 * Acesso centralizado as variaveis publicas. O Next substitui `process.env.NEXT_PUBLIC_*`
 * em tempo de build, entao a referencia precisa ser literal (nao indexada).
 */

/**
 * BOM (U+FEFF), zero-width space (U+200B) e espacos nas pontas - o tipo de
 * sujeira que vaza de painel de deploy e de CLI. Construido via `new RegExp`
 * de proposito, para nao carregar caracteres invisiveis no proprio fonte.
 */
const INVISIBLE_EDGES = new RegExp('^[\\uFEFF\\u200B\\s]+|[\\uFEFF\\u200B\\s]+$', 'g');

/**
 * Sanitiza um valor de ambiente antes de virar URL base: remove caracteres
 * invisiveis das pontas e a barra final.
 *
 * Nao e paranoia. Um BOM no inicio do valor faz a string deixar de comecar por
 * um scheme valido; o `fetch` passa a tratar a URL como relativa e as chamadas
 * batem no proprio dominio do frontend (`/https://api.../health` -> 404). Foi
 * exatamente o que aconteceu ao gravar a variavel na Vercel via stdin do
 * Windows PowerShell, que adiciona BOM por padrao.
 */
function normalizeBaseUrl(raw: string | undefined, fallback: string): string {
  const cleaned = (raw ?? '').replace(INVISIBLE_EDGES, '').replace(/\/+$/, '');

  return cleaned === '' ? fallback : cleaned;
}

export const env = {
  apiUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:3333'),
  vapidPublicKey: (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '').replace(INVISIBLE_EDGES, ''),
} as const;
