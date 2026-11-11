# F01 — T07 — Home e layout logado

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 01, 02 e 05

## Objetivo

Entregar a Home / Vazio e o layout das telas logadas, com a verificação da Sessão a cada
renderização, o menu da Pessoa com Sair e as proteções de cache.

## Escopo

- Layout logado em Server Component que verifica a Sessão em toda renderização, com `cache()`
  por requisição para o layout e a página compartilharem a mesma verificação.
- 200: renderiza a tela. 401: apaga o cookie e leva a `/entrar?para=<caminho>`. Falha de rede,
  5xx ou tempo esgotado: porta de erro com "Tentar de novo", sem levar a entrar.
- `src/app/page.tsx` com o frame Home / Vazio, usando `Rail`, `Sidebar`, `EmptyState` e o menu da
  Pessoa; nenhum item de navegação de outra funcionalidade ganha rota nesta tarefa.
- `src/app/components/workspace-nav/` com Rail e Sidebar, e `src/app/components/user/` com o
  UserMenu e a ação Sair.
- `Cache-Control: no-store` nas telas logadas e recarga no `pageshow` com `persisted` (LLD, seção
  8).
- Textos do frame Home / Vazio e do menu da Pessoa no Figma; temas claro e escuro.

## Critérios de aceite

- [ ] A Home só renderiza com Sessão válida; 401 leva a `/entrar` e apaga o cookie.
- [ ] Falha de verificação mostra a porta de erro e não leva a entrar.
- [ ] O menu da Pessoa mostra a Pessoa da Sessão e Sair encerra a Sessão daquele navegador e leva
      a `/entrar`.
- [ ] Recarregar, abrir outra aba e voltar pelo histórico não mostram conteúdo de Sessão
      encerrada.
- [ ] A Home segue os frames Home / Vazio e menu da Pessoa, nos dois temas.
- [ ] Tudo funciona por teclado.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefas 01, 02 e 05. A questão em aberto 2 (apagar o cookie no 401) precisa estar resolvida.
