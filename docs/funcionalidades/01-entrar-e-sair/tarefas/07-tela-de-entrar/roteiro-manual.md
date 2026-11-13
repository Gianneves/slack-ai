# Roteiro manual da F01-T07

Passos de CA1 a CA6, CA8, CA9 e CA10. O `chat-api` fica parado nos estados de falha; a web continua
no ar. CA1 a CA4, CA6 e CA9 estão previstos como testes Playwright na F01-T09; até lá, este roteiro
e as capturas de `docs/design/login/` são a prova manual.

## Preparação

1. Suba o ambiente e a web:

   ```bash
   docker compose -f compose.yaml up -d --build --wait
   docker compose -f compose.yaml exec web pnpm build
   docker compose -f compose.yaml exec -d web sh -c 'pnpm start > /tmp/web.log 2>&1'
   ```

2. Crie a Pessoa de teste, se ainda não existir:

   ```bash
   docker compose -f compose.yaml exec -T chat-api pnpm build
   docker compose -f compose.yaml exec -T chat-api pnpm accounts create-person pessoa.t07@empresa.com "Pessoa T07" <<< "SenhaForte-T07"
   ```

3. Guarde um token de Sessão para os passos com `curl`:

   ```bash
   curl -s -X POST http://localhost:3001/v1/sessions \
     -H 'Content-Type: application/json' \
     -d '{"email":"pessoa.t07@empresa.com","password":"SenhaForte-T07"}'
   ```

## CA1 — credencial válida chega à Home ou ao `para`

1. Abra `http://localhost:3000/entrar` e entre com `pessoa.t07@empresa.com` e `SenhaForte-T07`.
   Esperado: a Home, com "Pessoa T07" (`docs/design/login/home-apos-entrar.png`).
2. Sair, abrir `http://localhost:3000/entrar?para=%2Fcanais%3Fx%3D1` e entrar de novo. Esperado:
   o navegador vai para `/canais?x=1` (404, porque a tela ainda não existe, mas o destino foi
   respeitado).

## CA2 — credencial errada e e-mail sem conta mostram a mesma mensagem

1. Entre com a senha errada e confira "E-mail ou senha incorretos. Verifique e tente de novo."
2. Repita com um e-mail sem conta. A mensagem é a mesma, a tela continua em `/entrar` e uma nova
   tentativa com a credencial certa entra.
   Captura: `docs/design/login/entrar-credencial-invalida.png`.

## CA3 — bloqueio mostra o tempo e não grava a Sessão

1. Erre a senha cinco vezes para o mesmo e-mail, por exemplo com `curl` contra a API.
2. Tente de novo, inclusive com a senha certa. Esperado: a mensagem "Muitas tentativas. Tente de
   novo em `<tempo>`." e nenhum `Set-Cookie` de Sessão
   (`docs/design/login/entrar-bloqueio.png`).
3. Confira no navegador que o cookie `session` continua ausente e que o botão segue ativo.

## CA4 — Sessão válida em `/entrar` vai para a Home

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  -H 'Cookie: session=<token>' http://localhost:3000/entrar
```

Esperado: `307` com `Location: /`. No navegador, o formulário não aparece.

## CA5 — falha de verificação mostra a porta de erro

1. Pare o `chat-api`:

   ```bash
   docker compose -f compose.yaml stop chat-api
   ```

2. Abra `/entrar` com um cookie de Sessão que existia:

   ```bash
   curl -s -H 'Cookie: session=<token>' http://localhost:3000/entrar
   ```

   Esperado: `200` com "Não foi possível verificar sua sessão" e "Tentar de novo", não o
   formulário, e nenhum redirecionamento para `/entrar`.

3. Suba o `chat-api` (`pnpm start:dev`) e ative "Tentar de novo" no navegador: a verificação é
   refeita e a Home aparece.

## CA6 — teclado e anúncio acessível

1. Abra `/entrar` e confira o foco inicial no e-mail.
2. Percorra com Tab: e-mail → senha → Entrar. Digite a credencial e envie com Enter.
3. Confira no inspetor: a mensagem fica em `#login-error` com `role="alert"`; os dois campos
   recebem `aria-invalid="true"` e `aria-describedby="login-error"` nos estados de credencial
   inválida e validação.
4. O axe entra com a suíte da F01-T09; até lá, a conferência é a estrutura acima.

## CA8 — verificação da web

```bash
docker compose -f compose.yaml exec web pnpm lint
docker compose -f compose.yaml exec web pnpm exec tsc --noEmit
docker compose -f compose.yaml exec web pnpm build
```

Esperado: os três terminam com sucesso.

## CA9 — Sessão recusada em `/entrar` apaga o cookie

```bash
printf 'localhost\tFALSE\t/\tFALSE\t0\tsession\ttoken-invalido\n' > /tmp/jar
curl -s -b /tmp/jar -c /tmp/jar -L --max-redirs 5 \
  -o /dev/null -w '%{url_effective} %{http_code}\n' http://localhost:3000/entrar
```

Esperado: `http://localhost:3000/entrar 200`, o jar sem o cookie `session` e o formulário no
corpo, sem a porta de erro.

## CA10 — API fora no envio mantém o formulário

1. Abra `/entrar`, preencha a credencial e pare o `chat-api` antes de enviar.
2. Envie. Esperado: continua em `/entrar`, com "Não foi possível entrar agora. Tente de novo em
   instantes.", o botão de volta ao normal e nenhuma porta de erro de sessão
   (`docs/design/login/entrar-api-indisponivel.png`).
3. Suba o `chat-api` e envie de novo: entra e chega à Home.
