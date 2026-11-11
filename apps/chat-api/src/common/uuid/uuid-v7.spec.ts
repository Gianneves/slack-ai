import { describe, expect, it } from 'vitest';
import { generateUuidV7 } from './uuid-v7.js';

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const FALL_2026 = new Date('2026-11-01T00:00:00.000Z');

describe('generateUuidV7', () => {
  it('tem o formato de UUID v7 com a versão e a variante certas', () => {
    expect(generateUuidV7(FALL_2026)).toMatch(UUID_V7_PATTERN);
  });

  it('leva o timestamp pedido nos 12 primeiros hexadecimal', () => {
    const uuid = generateUuidV7(FALL_2026);
    const expectedPrefix = BigInt(FALL_2026.getTime())
      .toString(16)
      .padStart(12, '0');

    const hex = uuid.replaceAll('-', '');

    expect(hex.startsWith(expectedPrefix) && hex[12] === '7').toBe(true);
  });

  it('gera valores diferentes a cada chamada', () => {
    const first = generateUuidV7(FALL_2026);
    const second = generateUuidV7(FALL_2026);

    expect(second).not.toBe(first);
  });
});
