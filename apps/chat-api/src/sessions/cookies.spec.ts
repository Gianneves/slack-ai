import { describe, expect, it } from 'vitest';
import { readCookie } from './cookies.js';

describe('readCookie', () => {
  it('lê o cookie pelo nome no meio de outros cookies', () => {
    const header = 'tema=escuro; session=token-da-sessao; outro=1';

    const value = readCookie(header, 'session');

    expect(value).toBe('token-da-sessao');
  });

  it('devolve null quando o cabeçalho não tem o cookie', () => {
    const header = 'tema=escuro; outro=1';

    const value = readCookie(header, 'session');

    expect(value).toBeNull();
  });

  it('devolve null quando não há cabeçalho', () => {
    const value = readCookie(undefined, 'session');

    expect(value).toBeNull();
  });

  it('devolve null quando o valor do cookie está vazio', () => {
    const header = 'session=';

    const value = readCookie(header, 'session');

    expect(value).toBeNull();
  });
});
