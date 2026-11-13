# Roteiro manual da F01-T06

Passos de CA3, CA6 e CA7. O `chat-api` fica parado nos passos de falha de verificação; a web
continua no ar. A Home desta tarefa mostra só a Pessoa da verificação, porque o conteúdo final é
da F01-T08.

## Preparação

1. Suba o ambiente e a web:

   ```bash
   docker compose -f compose.yaml up -d --build --wait
   docker compose -f compose.yaml exec web pnpm build
   docker compose -f compose.yaml exec -d web sh -c 'pnpm start > /tmp/web.log 2>&1'
   ```

2. Suba o `chat-api` e entre com uma Pessoa que tenha Sessão. Guarde o token do cookie `session`
   para repetir as requisições com `curl`.

3. Confira a Home com Sessão válida:

   ```bash
   curl -s -D - -o /dev/null -H 'Cookie: session=<token>' http://localhost:3000/
   ```

   Esperado: `200`, `Cache-Control: no-store` e o nome da Pessoa no corpo.

## CA3 — falha de verificação mostra a porta de erro

1. Pare o `chat-api`:

   ```bash
   docker compose -f compose.yaml stop chat-api
   ```

2. Abra a Home com o cookie de uma Sessão que existia:

   ```bash
   curl -s -D - -H 'Cookie: session=<token>' http://localhost:3000/
   ```

   Esperado: `200` com "Não foi possível verificar sua sessão", o link "Tentar de novo" e
   `role="alert"`; nenhum redirecionamento para `/entrar`.

3. Repita no navegador: a tela logada mostra a porta de erro e continua na Home.
4. Suba o `chat-api` e ative "Tentar de novo": a Home volta a renderizar a Pessoa.

## CA6 — sem cache e sem bfcache depois de sair

1. Com o `chat-api` no ar e uma Sessão válida, inspecione a resposta da Home:

   ```bash
   curl -s -D - -o /dev/null -H 'Cookie: session=<token>' http://localhost:3000/
   ```

   Esperado: `Cache-Control: no-store`.

2. No navegador, entre, abra a Home e saia pela ação de sair da F01-T05/F01-T08. Depois, use o
   botão de voltar do histórico.
   Esperado: a página recarrega (`pageshow` com `persisted`) e não mostra o nome da Pessoa, porque
   a Sessão foi encerrada e a verificação recebe 401.

## CA7 — teclado e anúncio da falha

1. Com o `chat-api` parado, abra a Home com uma Sessão no navegador.
2. Percorra a tela só pelo teclado, com Tab: alcance "Tentar de novo" com foco visível e ative com
   Enter.
3. Confira que a falha é anunciada: o contêiner da porta de erro tem `role="alert"`.
4. Rode o axe no estado de erro (a suíte da F01-T09 usa `@axe-core/playwright`): nenhuma violação.

## Resultado das conferências por `curl`

- `GET /` com Sessão válida: `200`, `Cache-Control: no-store` e "Pessoa T06" no corpo.
- `GET /` com token inválido: verificação não autenticada, redirecionamento para
  `/api/session/clear?para=%2F`.
- `GET /api/session/clear?para=%2Fcanais%3Fx%3D1`: `303`, `Location:
  /entrar?para=%2Fcanais%3Fx%3D1`, `Set-Cookie: session=; Path=/; Max-Age=0; HttpOnly;
  SameSite=lax` e `Cache-Control: no-store`.
- `GET /api/session/clear?para=//evil.com`: `303` com `Location: /entrar`; o `para` inválido é
  tratado como ausente.
- `GET /` com o `chat-api` parado: `200`, "Não foi possível verificar sua sessão", "Tentar de
  novo" e `role="alert"`, sem redirecionamento.
