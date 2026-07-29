/**
 * Fornece o token de desenvolvedor usado para autenticar na API da Supercell.
 *
 * Existe como porta por um motivo concreto: o token oficial e vinculado a um
 * conjunto fixo de IPs, e o IP de saida do Railway nao e estatico. Isolar a
 * obtencao do token deixa as duas estrategias possiveis intercambiaveis sem
 * tocar no gateway:
 *
 * 1. `StaticSupercellTokenProvider` (implementado) - token fixo em variavel de
 *    ambiente. Requer que o IP de saida esteja na allowlist, tipicamente via
 *    proxy de IP fixo.
 * 2. Renovacao automatica no boot pela API do developer portal, criando uma
 *    chave para o IP corrente. Entra como um segundo adapter quando a
 *    estrategia for decidida.
 */
export abstract class SupercellTokenPort {
  abstract getToken(): Promise<string>;
}
