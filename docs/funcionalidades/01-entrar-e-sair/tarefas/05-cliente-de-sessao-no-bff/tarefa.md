# F01 — T05 — Cliente de Sessão no BFF

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** 03 — Verificação e saída da Sessão na API (questão em aberto 1)

## Objetivo

Ligar a web à API do chat: guardar o token no cookie httpOnly, repassar o cookie nas chamadas,
traduzir os erros em resultado de Server Action e proteger as telas logadas pela existência do
cookie.

## Escopo

- `src/config/env.ts` com schema zod para `CHAT_API_URL`, `SESSION_COOKIE_NAME`,
  `SESSION_COOKIE_DOMAIN` e `SESSION_COOKIE_SECURE`, validado na subida; `.env.example` com
  valores falsos.
- `src/app/services/sessions.ts`, com `fetch`: entrar, verificar e sair; monta o cabeçalho
  `Cookie` com o cookie de Sessão; lê `application/problem+json`; lê o `Retry-After`; trata rede,
  5xx e o tempo limite de 5 segundos da verificação.
- `src/app/actions/session.ts`: Server Action `entrar` (recebe e-mail, senha e `para`; grava o
  cookie com `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` de 400 dias e o `Domain` da
  variável; redireciona em caso de sucesso; devolve o erro) e `sair` (chama a API, apaga o cookie
  e redireciona para `/entrar`).
- `src/app/utils/`: a validação do `?para`, que só aceita caminho relativo começando com `/` e
  não com `//`.
- `src/proxy.ts`, no Next 16: confere só a existência do cookie e redireciona para
  `/entrar?para=<caminho>`; a validação de verdade é da API.
- Porta para apagar o cookie no 401, conforme a questão em aberto 2.
- Nenhum log de token, cookie ou corpo de requisição.

## Critérios de aceite

- [ ] Entrar grava o cookie com todos os atributos do LLD, seção 3, e redireciona para o `para`
      válido ou para a Home.
- [ ] Sair chama a API, apaga o cookie e leva a `/entrar`; as outras Sessões continuam válidas.
- [ ] O `?para=` inválido ou `//outro` cai na Home; a validação é refeita no servidor.
- [ ] A verificação distingue 200, 401 e falha de rede, 5xx ou tempo esgotado.
- [ ] O proxy não faz chamada à API e protege a área logada.
- [ ] O token não vai para log, nem para o navegador fora do cookie httpOnly.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefa 03. As telas 06 e 07 dependem desta. A questão em aberto 2 precisa estar resolvida antes
do plano.
