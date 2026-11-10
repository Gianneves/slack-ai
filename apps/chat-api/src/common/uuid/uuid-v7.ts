import { randomBytes } from 'node:crypto';

// UUID v7 gerado na aplicação (ADR 0022): 48 bits de timestamp em
// milissegundos, versão 7 e demais bytes aleatórios.
export function generateUuidV7(now: Date = new Date()): string {
  const timestamp = now.getTime();
  const buffer = Buffer.alloc(16);
  buffer.writeUIntBE(timestamp, 0, 6);
  const random = randomBytes(10);
  random.copy(buffer, 6);
  buffer[6] = (buffer[6] & 0x0f) | 0x70;
  buffer[8] = (buffer[8] & 0x3f) | 0x80;

  const hex = buffer.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
