import { describe, expect, it } from 'vitest';
import { readCookie } from './cookies.js';

describe('readCookie', () => {
  it('lê o cookie pelo nome no meio de outros cookies', () => {
    const header = 'tema=escuro; session=token-da-sessao; outro=1';

    expect(readCookie(header, 'session')).toBe('token-da-sessao');
  });

  it('devolve null quando o cookie falta', () => {
    expect(readCookie('tema=escuro; outro=1', 'session')).toBeNull();
    expect(readCookie(undefined, 'session')).toBeNull();
  });

  it('devolve null quando o valor do cookie está vazio', () => {
    expect(readCookie('session=', 'session')).toBeNull();
  });
});
