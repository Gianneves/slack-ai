# F01 — T07 — Tela de entrar

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 06 — Porta de sessão e layout autenticado

## Objetivo

Entregar a tela `/entrar` com todos os estados do PRD e do design system, incluindo a porta de
sessão de quem chega com cookie.

## Decisões consumidas de outras tarefas

- O resultado discriminado da Server Action (`invalid_credentials`, `too_many_attempts` com o
  tempo, `validation_error`, `unavailable`) vem da tarefa 05.
- A verificação cacheada, a limpeza do cookie no 401 e a porta de erro vêm da tarefa 06.
- A validação do `?para=` vem da tarefa 05.

## Escopo

- `src/app/entrar/page.tsx` como Server Component: lê o `?para=`; com cookie, verifica a Sessão
  pela porta da tarefa 06 (200 vai para a Home, 401 apaga o cookie e mostra o formulário, falha
  mostra a porta de erro).
- `src/app/components/auth/` com o formulário em Client Component, usando a Server Action
  `entrar` e `useActionState`.
- Estados: padrão, carregando, credencial inválida, validação, bloqueio com o tempo que falta e
  API indisponível.
- Campos com `Field`, `Input`, `Button` e `Spinner`; foco no primeiro campo; tudo por teclado.
- Textos do frame Login do Figma; nenhum texto inventado. Os temas claro e escuro.
- A porta de erro de sessão vem da tarefa 06: mensagem, "Tentar de novo" e nenhum
  redirecionamento para entrar por causa da falha.

## Critérios de aceite

- [ ] **CA1** · Entrar com credencial certa chega à Home, ou à página do `para` válido.
- [ ] **CA2** · Credencial errada e e-mail sem conta mostram a mesma mensagem e permitem tentar de
      novo.
- [ ] **CA3** · O bloqueio mostra quanto tempo falta e não deixa a tentativa parecer bem-sucedida.
- [ ] **CA4** · Abrir `/entrar` com Sessão válida vai direto para a Home.
- [ ] **CA5** · Falha de verificação mostra a porta de erro, não o formulário.
- [ ] **CA6** · O formulário funciona por teclado e anuncia os erros de forma acessível.
- [ ] **CA7** · A tela está de acordo com os frames Login e com a porta de erro, nos dois temas.
- [ ] **CA8** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefa 06, que traz a porta de sessão, a verificação e a porta de erro. A questão em aberto 2
precisa estar resolvida antes do plano.
