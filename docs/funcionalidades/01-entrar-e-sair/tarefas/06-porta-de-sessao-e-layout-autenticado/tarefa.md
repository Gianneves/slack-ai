# F01 — T06 — Porta de sessão e layout autenticado

Status: concluída

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 02 e 05

## Objetivo

Entregar a porta única de sessão, usada pela tela de entrar e pelas telas logadas: verificação
cacheada, limpeza do cookie no 401, porta de erro de sessão e o layout autenticado que só
renderiza a tela com Sessão válida.

## Decisões consumidas de outras tarefas

- O nome do cookie de Sessão vem da tarefa 03.
- O contrato de verificação (200, 401 e falha) e a validação do `?para=` vêm da tarefa 05.
- Os componentes de UI da porta de erro vêm da tarefa 02.
- A porta de limpeza do cookie no 401 é a rota `GET /api/session/clear?para=`, da questão em
  aberto 2 resolvida.

## Escopo

- Verificação da Sessão com o `cache()` do React, uma vez por requisição, reutilizando o serviço
  da tarefa 05; o resultado é discriminado em autenticada, não autenticada e indisponível.
- Porta para apagar o cookie no 401: rota `GET /api/session/clear?para=`, que valida o `para`,
  apaga o cookie e leva a `/entrar`.
- `src/app/components/session/` com a porta de erro: mensagem de que não foi possível verificar a
  sessão, "Tentar de novo" e nenhum redirecionamento para entrar por causa da falha.
- Layout autenticado em Server Component, no grupo de rotas logadas: verifica a Sessão em toda
  renderização; 200 renderiza a tela; 401 apaga o cookie e leva a `/entrar?para=<caminho>`; falha
  de rede, 5xx ou tempo esgotado mostra a porta de erro.
- `Cache-Control: no-store` nas telas logadas e recarga no `pageshow` com `persisted` (LLD, seção
  8).
- A página existente entra no grupo logado para servir de prova da porta; o conteúdo da Home é da
  tarefa 08 e o formulário é da tarefa 07.
- A tela de entrar e a Home usam esta porta, sem duplicar verificação nem microtexto de erro.

## Critérios de aceite

- [x] **CA1** · Uma Sessão válida renderiza a tela logada, e a Pessoa vem da verificação.
- [x] **CA2** · Uma Sessão vencida ou revogada apaga o cookie e leva a `/entrar?para=<caminho>` na
      renderização seguinte.
- [x] **CA3** · Falha de rede, 5xx ou tempo esgotado mostra a porta de erro e não leva a entrar.
- [x] **CA4** · A verificação acontece uma vez por requisição, mesmo sendo usada pelo layout e
      pela página.
- [x] **CA5** · A porta de erro é a mesma consumida pela tela de entrar, sem duplicação.
- [x] **CA6** · As telas logadas saem com `Cache-Control: no-store`, e voltar pelo histórico não
      mostra conteúdo de Sessão encerrada.
- [x] **CA7** · A porta de erro funciona por teclado e anuncia a falha de forma acessível.
- [x] **CA8** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefas 02 e 05. A questão em aberto 2 está resolvida pela rota `GET /api/session/clear?para=`. As
tarefas 07 e 08 dependem desta porta.
