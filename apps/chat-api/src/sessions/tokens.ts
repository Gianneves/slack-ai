// Token de sessão (LLD, "Segurança"): aleatório de 32 bytes, entregue ao
// BFF uma vez, ao entrar. O banco guarda só o SHA-256 do token, então um
// vazamento do banco não dá sessões válidas. O token nunca vai para o log.
import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

export function createSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
