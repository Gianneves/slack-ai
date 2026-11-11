# F01 — T05 — Cliente de Sessão no BFF

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** 03 — Verificação e saída da Sessão na API

## Objetivo

Ligar a web à API do chat: guardar o token no cookie httpOnly, repassar o cookie nas chamadas,
traduzir os erros em resultado de Server Action e proteger as telas logadas pela existência do
cookie.

## Decisões consumidas de outras tarefas

- O nome do cookie de Sessão, igual na API e no BFF, vem da tarefa 03.

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
- O serviço expõe a verificação crua que a porta de sessão da tarefa 06 consome; a limpeza do
  cookie no 401 é da tarefa 06.
- Nenhum log de token, cookie ou corpo de requisição.

## Critérios de aceite

- [ ] **CA1** · Entrar grava o cookie com todos os atributos do LLD, seção 3, e redireciona para o
      `para` válido ou para a Home.
- [ ] **CA2** · Sair chama a API, apaga o cookie e leva a `/entrar`; as outras Sessões continuam
      válidas.
- [ ] **CA3** · O `?para=` inválido ou `//outro` cai na Home; a validação é refeita no servidor.
- [ ] **CA4** · A verificação distingue 200, 401 e falha de rede, 5xx ou tempo esgotado.
- [ ] **CA5** · O proxy não faz chamada à API e protege a área logada.
- [ ] **CA6** · O token não vai para log, nem para o navegador fora do cookie httpOnly.
- [ ] **CA7** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefa 03, pelo nome do cookie e pelo contrato da API. A tarefa 06 consome o serviço e as ações
desta; as telas 07 e 08 dependem dela pela porta de sessão.
