// Lê um cookie do cabeçalho Cookie (RFC 6265) sem dependência nova. O token
// de Sessão é base64url, então não há codificação a decodificar.
export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }
    const value = part.slice(separator + 1).trim();
    return value.length === 0 ? null : value;
  }

  return null;
}
