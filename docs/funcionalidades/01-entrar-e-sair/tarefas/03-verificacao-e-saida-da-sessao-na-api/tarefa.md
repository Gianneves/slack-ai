# F01 — T03 — Verificação e saída da Sessão na API

Status: em andamento

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** —

## Objetivo

Completar a Sessão na API do chat: verificar e renovar a Sessão apresentada e apagá-la ao sair,
com o erro de domínio e o guard que as rotas protegidas vão usar.

## Escopo

- `UnauthenticatedError`, com `code` `unauthenticated`, e a entrada dele em `ErrorCode` e no mapa
  de status do `DomainExceptionFilter` (401). O LLD 6.2 e a rule de erros já preveem esse guard e
  esse erro.
- `AuthGuard`: lê o cookie de Sessão do cabeçalho `Cookie`, chama o service e anexa ao request a
  Sessão autenticada e a Pessoa; token ausente, desconhecido ou vencido lança `unauthenticated`.
- `SessionsService.authenticate` e `SessionsService.logout`; o service devolve dados simples e
  não importa nada de HTTP.
- `SessionsRepository`: busca por `token_hash`, renovação condicional com `last_used_at` e
  `expires_at`, apagar por id e apagar Sessões de uma Pessoa.
- Constante de 1 dia do intervalo de renovação; a duração continua em `SESSION_TTL_DAYS`.
- `GET /v1/sessions/current` (200 com `person` de `id`, `name` e `email`; 401) e
  `DELETE /v1/sessions/current` (204; 401).
- Nome do cookie de Sessão na configuração da API, conforme a decisão da questão 1.
- Ampliar `test/sessions.e2e-spec.ts` com os casos da seção 8 da spec: renovação condicional,
  Sessão vencida apagada, corpo igual para cookie ausente, token desconhecido e Sessão vencida,
  sair sem afetar as outras Sessões e Sessão revogada recusada.

## Critérios de aceite

- [ ] **CA1** · Uma Sessão válida devolve a Pessoa no `GET` e só renova depois de 1 dia desde
      `last_used_at`.
- [ ] **CA2** · Cookie ausente, token desconhecido e Sessão vencida devolvem o mesmo 401
      `unauthenticated`, e a Sessão vencida é apagada.
- [ ] **CA3** · O `DELETE` apaga só a Sessão apresentada; as outras Sessões da Pessoa continuam
      válidas.
- [ ] **CA4** · Uma Sessão revogada por apagar a linha recebe 401 na requisição seguinte.
- [ ] **CA5** · O token não aparece em log, em resposta de erro nem no corpo do `DELETE`.
- [ ] **CA6** · Os testes novos passam em `pnpm test:e2e`, e `pnpm lint`, `pnpm exec tsc --noEmit`,
      `pnpm test`, `pnpm test:int` e `pnpm build` também.
- [ ] **CA7** · Nenhuma migração nova.

## Dependências

Nenhuma de código. A tarefa 05 (BFF) depende desta; a 04 usa os métodos do repository.
