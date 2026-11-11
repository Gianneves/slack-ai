// Limiares do limite de tentativas de login, fixos na API do chat
// (LLD, "Valores e configuração"; ADR 0023):
// - tentativas de login: 5
// - janela de tentativas de login: 15 min
// - bloqueio do login: 15 min
export const LOGIN_ATTEMPT_LIMIT: number = 5;
export const LOGIN_WINDOW_SECONDS: number = 15 * 60;
export const LOGIN_BLOCK_SECONDS: number = 15 * 60;
