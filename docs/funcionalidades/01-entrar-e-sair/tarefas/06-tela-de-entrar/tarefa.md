# F01 — T06 — Tela de entrar

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 01, 02 e 05

## Objetivo

Entregar a tela `/entrar` com todos os estados do PRD e do design system, incluindo a porta de
sessão de quem chega com cookie.

## Escopo

- `src/app/entrar/page.tsx` como Server Component: lê o `?para=`; com cookie, verifica a Sessão
  (200 vai para a Home, 401 apaga o cookie e mostra o formulário, falha mostra a porta de erro).
- `src/app/components/auth/` com o formulário em Client Component, usando a Server Action
  `entrar` e `useActionState`.
- Estados: padrão, carregando, credencial inválida, validação, bloqueio com o tempo que falta e
  API indisponível.
- Campos com `Field`, `Input`, `Button` e `Spinner`; foco no primeiro campo; tudo por teclado.
- Textos do frame Login do Figma; nenhum texto inventado. Os temas claro e escuro.
- A porta de erro de sessão é a mesma das telas logadas: mensagem, "Tentar de novo" e nenhum
  redirecionamento para entrar por causa da falha.

## Critérios de aceite

- [ ] Entrar com credencial certa chega à Home, ou à página do `para` válido.
- [ ] Credencial errada e e-mail sem conta mostram a mesma mensagem e permitem tentar de novo.
- [ ] O bloqueio mostra quanto tempo falta e não deixa a tentativa parecer bem-sucedida.
- [ ] Abrir `/entrar` com Sessão válida vai direto para a Home.
- [ ] Falha de verificação mostra a porta de erro, não o formulário.
- [ ] O formulário funciona por teclado e anuncia os erros de forma acessível.
- [ ] A tela está de acordo com os frames Login e com a porta de erro, nos dois temas.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefas 01, 02 e 05. A questão em aberto 2 (apagar o cookie no 401) precisa estar resolvida.
