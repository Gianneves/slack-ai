// O e-mail é normalizado antes de tudo: sem os espaços das pontas e em
// minúsculas. É assim que ele é gravado, comparado e contado no limite
// (LLD, "Estados e regras", "Sessão e login").
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
