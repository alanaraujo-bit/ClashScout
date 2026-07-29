/**
 * Acesso centralizado as variaveis publicas. O Next substitui `process.env.NEXT_PUBLIC_*`
 * em tempo de build, entao a referencia precisa ser literal (nao indexada).
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
} as const;
