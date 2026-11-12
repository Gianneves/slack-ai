# Validação manual da F01-T05

Feita em 12/11/2026, no contêiner `web`, com o `chat-api` no ar e o `.env` local criado a partir do
`.env.example`.

## Proxy

- `curl http://localhost:3000/` sem cookie: 307 para `/entrar?para=%2F`.
- `curl http://localhost:3000/canais?x=1` sem cookie: 307 para
  `/entrar?para=%2Fcanais%3Fx%3D1`.
- `curl -H 'Cookie: session=qualquer' http://localhost:3000/`: 200, sem redirecionamento.
- `/entrar` sem cookie: 404, porque a tela é da T07; o proxy não a protege.

## Validador do `?para=`

`safeRedirectPath` devolveu `/` para `null`, vazio, `undefined`, `https://x`, `//outro` e
`/\evil.com`, e devolveu o valor para `/` e `/canais?x=1`.

## Verificação

`pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passaram no contêiner `web`.
