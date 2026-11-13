# Plano da F01-T08: Home e menu da Pessoa

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão válida, quando ela abre `/`, então a Home renderiza dentro
do layout autenticado, com a casca da tela Home / Vazio da referência de design (`Rail`, `Sidebar`
e `EmptyState`), e o menu da Pessoa mostra o nome vindo da verificação da Sessão, sem uma segunda
chamada à API.

**Teste previsto:** e2e da web, `e2e/home.spec.ts`, "Home renderiza a casca autenticada com a Pessoa
da Sessão".

### CA2

**Marca:** teste no Playwright

**Cenário:** Dado a Home com a Sessão da Pessoa, quando ela abre o menu da Pessoa e ativa Sair,
então o menu mostra a Pessoa da Sessão, a página chega a `/entrar` e o cookie de Sessão daquele
navegador deixa de existir; uma nova navegação para `/` volta a `/entrar`.

**Teste previsto:** e2e da web, `e2e/home.spec.ts`, "menu da Pessoa mostra a Pessoa da Sessão e Sair
leva a /entrar" e "depois de sair, abrir a Home volta a /entrar".

### CA3

**Marca:** revisão humana

**Cenário:** Dado a web no ar em 1440 × 900, quando quem revisa compara a Home / Vazio e o menu da
Pessoa aberto com a referência de design registrada em `docs/design/home/`, nos temas claro e
escuro, então encontra os mesmos textos, espaçamento, tipografia, cores, raios e elevação; o
registro fica no `validacao-visual.md` da tarefa, com as capturas dos dois temas.

### CA4

**Marca:** teste no Playwright

**Cenário:** Dado a Home aberta, quando a Pessoa percorre a tela só pelo teclado, então Tab alcança
o gatilho do menu da Pessoa, Enter ou Espaço o abre, as setas percorrem os itens, Enter em Sair
encerra a Sessão e leva a `/entrar`; as linhas estáticas da casca não entram na ordem de foco e não
há armadilha de foco.

**Teste previsto:** e2e da web, `e2e/home.spec.ts`, "menu da Pessoa e Sair funcionam só pelo
teclado".

### CA5

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web` com as dependências instaladas, quando quem revisa roda
`pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com sucesso.

## Contrato

O contrato não muda. A Home é uma tela do App Router servida em `/` e já registrada no LLD, seção 8,
"Telas"; não é rota de API nem rota do BFF. A tarefa consome a Server Action `sair` e a verificação
`GET /v1/sessions/current`, ambas com o contrato provado na F01-T05 e na F01-T06, sem alterar
campos, status, cabeçalhos ou comportamento. Nenhum evento de WebSocket e nenhuma tabela são
tocados.

## Verificação do contrato

- **Nenhuma rota, evento ou tabela nova:** a revisão do diff confirma que a tarefa só cria a casca e
  o menu, e que `sair` e `GET /v1/sessions/current` continuam iguais aos da F01-T05 e da F01-T06.
- **`sair` encerra a Sessão daquele navegador e leva a `/entrar`:** CA2 prova o caminho pela tela,
  do clique no item até a volta a `/entrar`, sem `Set-Cookie` de Sessão.
- **A Pessoa exibida é a da verificação da Sessão:** CA1 prova que o nome no menu é o devolvido por
  `GET /v1/sessions/current`; a revisão confere que a página não busca a Pessoa por outra rota.
- **Nenhum evento ou tabela:** não há item a provar; a revisão do diff confirma que a tarefa não
  toca `packages/chat-events` nem migrações.

## Decisões

- **A Home é Server Component; só o menu da Pessoa é Client Component.** A página lê a Sessão e
  monta a casca; `Rail`, `Sidebar` e `EmptyState` não têm estado. `UserMenu` embrulha o Radix e
  recebe a Pessoa como prop, porque o `DropdownMenu` precisa de cliente (`apps/web/AGENTS.md`,
  "Server Components").
- **A Home não repete a porta de sessão.** O layout autenticado da F01-T06 já renderiza
  `SessionBoundary` e `BfcacheReload`; a página chama `getSession()`, que continua cacheada por
  render, e usa `session.person` para o menu. Ela não declara uma segunda porta nem um segundo
  redirecionamento; com o status diferente de autenticado, devolve `null` (inalcançável depois do
  200 do layout).
- **A casca não inventa navegação.** As linhas do Rail e da Sidebar aparecem com o rótulo e o ícone
  da referência de design, mas nenhuma vira link nem ganha `href`: o escopo proíbe rota para outra
  funcionalidade. Como não são interativas, ficam fora da ordem de foco, sem `role` de botão e sem
  `aria-disabled`; só o gatilho do menu da Pessoa e o item Sair entram na ordem de foco. Se a
  referência mostrar a busca do workspace, ela entra na mesma regra, como linha estática, para não
  haver controle morto.
- **Sair reusa a Server Action da F01-T05, sem ação nova.** O item Sair é um
  `DropdownMenuItem asChild` com um `<button type="submit">` dentro de um `<form action={sair}>`;
  `onSelect` evita o fechamento do menu antes do envio, e o `redirect("/entrar")` da própria ação
  fecha a navegação. `sair` continua apagando o cookie e indo a `/entrar` mesmo com a API fora
  (spec, seção 6.3), e não há duplicação de service nem de validação.
- **O nome da Pessoa vem da Sessão, nunca de uma prop do layout.** A página lê `getSession()` e
  passa `session.person` ao menu; o Avatar usa as iniciais do nome e o menu mostra o nome, e o
  e-mail só se a referência de design mostrar. Nenhuma chamada nova à API nasce para isso.
- **O gatilho do menu tem nome acessível.** O Avatar é decorativo (`aria-hidden`, como na F01-T02),
  então o `DropdownMenuTrigger` recebe `aria-label` com o nome da Pessoa; o item Sair é um
  `menuitem` do Radix, alcançável por Tab e ativado por Enter ou Espaço.
- **Nenhum primitivo, token ou biblioteca nova.** A tela usa `Avatar`, `EmptyState` e
  `DropdownMenu` da F01-T02, `buttonVariants` quando precisar, os tokens da F01-T01, os ícones do
  `lucide-react` e o Radix já instalado; não há valor de cor, espaço ou raio fora do design system.
- **Os dois temas são conferidos por `data-theme="dark"`, não por um seletor novo.** A escolha de
  tema é da F02; esta tarefa não cria `ThemeToggle` nem grava preferência, e a validação visual
  troca o atributo no `<html>`, como a F01-T07 fez.
- **A referência de design da Home vem do Stitch, como na F01-T07.** Sem o MCP do Figma, a
  implementação cria no Stitch o projeto da Home com as telas Home / Vazio e menu da Pessoa aberto,
  nos temas claro e escuro, usando os tokens de `docs/design-system.md` (com Source Sans 3 no lugar
  da Lato, que o Stitch não oferece), e registra o microtexto aprovado e as capturas em
  `docs/design/home/README.md`. A comparação com os frames do Figma continua pendente na questão 9
  da spec, como na tela de entrar.
- **Os documentos que davam a Home e o menu como frames do Figma passam a apontar para a referência
  do Stitch.** O escopo da tarefa e a spec (decisão 9 e questão 9) são atualizados no commit de
  plano; o fluxo geral com o Figma em `docs/design-system.md` não muda, porque o produto continua
  com o Figma como fonte e a referência do Stitch é a substituta registrada enquanto ele não está
  acessível.
- **Posição do menu, textos e ícones seguem a referência de design.** A página compõe a casca na
  ordem da tela Home / Vazio, e o menu da Pessoa fica onde a referência o coloca; a implementação
  não acrescenta rótulo, seção ou ação que a referência não tenha.
- **A casca desta tarefa é só de desktop.** O design system descreve a gaveta do Rail e da Sidebar
  abaixo de `md`, mas a tarefa não a lista e a F01-T02 não criou `IconButton` nem `Dialog`. A T08
  entrega a casca da tela de 1440 × 900; a gaveta fica numa tarefa própria da casca, com o
  primitivo e o teste, e a pendência entra como questão em aberto na spec no commit de plano. O
  produto é de navegador de desktop e celular e tablet estão fora de escopo no PRD.
- **A suíte Playwright continua na F01-T09.** A spec, seção 8, define um único ponto de teste da
  web, a suíte da T09; por isso CA1, CA2 e CA4 são previstos para `e2e/home.spec.ts` e esta tarefa
  não monta a infraestrutura de e2e. A T09 já lista Sair e o axe da Home no escopo.
- **O caminho da Home no escopo da tarefa é corrigido.** O `tarefa.md` cita `src/app/page.tsx`, mas
  a Home vive em `src/app/(app)/page.tsx` desde a F01-T06; o commit de plano corrige o texto para o
  arquivo que existe, sem tocar no resto do escopo.

## Arquivos e interfaces

- `apps/web/src/app/(app)/page.tsx` (alterado): `Home()` assíncrona, sem a `SessionBoundary` local;
  chama `getSession()`, devolve `null` fora de `authenticated` e compõe a casca com `Rail`,
  `Sidebar` e o `EmptyState` da referência de design, passando `session.person` ao menu.
- `apps/web/src/app/components/workspace-nav/rail.tsx` (novo): `Rail()`; `<nav>` com nome acessível
  próprio e as linhas estáticas da referência de design.
- `apps/web/src/app/components/workspace-nav/sidebar.tsx` (novo): `Sidebar({ person }: { person:
  Person })`; `<nav>` com nome acessível próprio, as linhas estáticas da referência de design e o
  `UserMenu` na posição que ela define.
- `apps/web/src/app/components/user/user-menu.tsx` (novo): `"use client"`; `UserMenu({ person }:
  { person: Person })`; `DropdownMenu`, `DropdownMenuTrigger` com `aria-label`, `Avatar`,
  `DropdownMenuContent` com o nome da Pessoa e o item Sair com `<form action={sair}>` e
  `DropdownMenuItem asChild`.
- `docs/design/home/README.md` (novo, na implementação): projeto e telas do Stitch, microtexto
  aprovado, capturas e a pendência de comparação com os frames do Figma.
- `docs/design/README.md` (alterado, na implementação): passa a apontar para a referência da Home
  em `home/README.md`, além da referência da tela de entrar.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/08-home-e-menu-da-pessoa/validacao-visual.md`
  (novo, na implementação): registro do CA3 nos dois temas, com as capturas na mesma pasta.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/08-home-e-menu-da-pessoa/tarefa.md`: Status para
  "em andamento", caminho do escopo para `src/app/(app)/page.tsx` e fonte dos textos para a
  referência de design em `docs/design/home/`.

Nenhuma mudança em `apps/web/src/app/actions/session.ts`, `services/sessions.ts`,
`queries/session.ts`, `components/session/`, `proxy.ts`, `globals.css`, `package.json` ou no
`compose.yaml`.

## Testes existentes que mudam

Nenhum teste automatizado existe na web ainda; a suíte Playwright nasce na F01-T09. O caso previsto
na F01-T06 CA1 (`e2e/session.spec.ts`, "Sessão válida renderiza a Home com a Pessoa da verificação")
passa a olhar a Home com a casca, mas a asserção sobre a Pessoa da Sessão continua a mesma.

## Mudança de dados

Nenhuma. Não há seed nem backfill; a Sessão e a Pessoa continuam sendo as da API.

## Documentos atualizados

- `docs/funcionalidades/01-entrar-e-sair/tarefas/08-home-e-menu-da-pessoa/tarefa.md`, seção
  "Escopo": o caminho da Home passa a `src/app/(app)/page.tsx` e os textos passam a vir da
  referência de design em `docs/design/home/`; Status para "em andamento".
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 2, decisão 9: os textos da Home e do menu
  da Pessoa passam a sair da referência do Stitch enquanto os frames do Figma não forem comparados,
  como já vale para a tela de entrar.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9, questão 9: o parcial passa a cobrir a
  F01-T08, com a Home e o menu da Pessoa na referência `docs/design/home/`; a comparação com os
  frames do Figma continua pendente.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9: nova questão em aberto sobre a gaveta
  do Rail e da Sidebar abaixo de `md`, que fica fora da F01-T08 e precisa de tarefa própria da
  casca.
- Nenhum documento de regra do HLD ou do LLD muda no commit de plano. O HLD e o LLD já descrevem a
  Home e o Sair na seção 8, e a spec fixa o fluxo na seção 6.3.
- `docs/lld.md`, seção 8, "Telas": a situação de `/` (Home) passa de "planejada" para "existe" no
  fim da implementação, porque a tabela é uma foto do estado.
- `docs/design-system.md`, seção "Estado atual": a linha "Telas" passa a incluir a Home no fim da
  implementação, também como foto do estado.
