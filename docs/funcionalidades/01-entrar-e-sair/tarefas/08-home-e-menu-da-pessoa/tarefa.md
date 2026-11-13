# F01 — T08 — Home e menu da Pessoa

Status: concluída

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 02 e 06

## Objetivo

Entregar a Home / Vazio dentro do layout autenticado e o menu da Pessoa com Sair.

## Decisões consumidas de outras tarefas

- A verificação da Sessão, as proteções de cache e a porta de erro vêm da tarefa 06.
- A Server Action `sair` e os atributos do cookie vêm da tarefa 05.
- Os componentes de UI vêm da tarefa 02.

## Escopo

- `src/app/(app)/page.tsx` com a tela Home / Vazio da referência de design, usando `Rail`,
  `Sidebar`, `EmptyState` e o menu da Pessoa; nenhum item de navegação de outra funcionalidade ganha
  rota nesta tarefa.
- `src/app/components/workspace-nav/` com Rail e Sidebar, e `src/app/components/user/` com o
  UserMenu e a ação Sair.
- Sair usa a Server Action da tarefa 05: encerra a Sessão daquele navegador e leva a `/entrar`,
  sem afetar as outras Sessões da Pessoa.
- O layout autenticado, as proteções de cache e a porta de erro ficam na tarefa 06; esta tarefa
  só preenche o conteúdo da tela.
- Textos da referência de design da Home / Vazio e do menu da Pessoa, em `docs/design/home/`; temas
  claro e escuro.

## Critérios de aceite

- [x] **CA1** · A Home renderiza dentro do layout autenticado, e a Pessoa exibida é a da Sessão.
- [x] **CA2** · O menu da Pessoa mostra a Pessoa da Sessão e Sair encerra a Sessão daquele
      navegador e leva a `/entrar`.
- [x] **CA3** · A Home segue os frames Home / Vazio e menu da Pessoa, nos dois temas.
- [x] **CA4** · Tudo funciona por teclado.
- [x] **CA5** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefas 02 e 06. A Home usa a porta de sessão e o layout da tarefa 06, e a ação Sair da tarefa 05.
