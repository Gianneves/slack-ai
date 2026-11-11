// Configuração de um assunto (.opencode/rules/nest-api-coding-standards.md):
// camelCase com o sufixo Config, e token de injeção Symbol exportado junto
// da interface. Duração da Sessão: 30 dias sem uso, variável
// SESSION_TTL_DAYS, padrão 30 (LLD, "Valores e configuração").
export interface SessionConfig {
  ttlDays: number;
}

export const SESSION_CONFIG = Symbol('SESSION_CONFIG');

export function sessionConfigFactory(): SessionConfig {
  const ttlDays = Number(process.env['SESSION_TTL_DAYS'] ?? '30');

  if (!Number.isInteger(ttlDays) || ttlDays < 1) {
    throw new Error('SESSION_TTL_DAYS inválido: use dias inteiros a partir de 1.');
  }

  return { ttlDays };
}
