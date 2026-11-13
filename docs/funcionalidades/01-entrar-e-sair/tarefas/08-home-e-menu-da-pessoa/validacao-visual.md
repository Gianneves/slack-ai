# Validação visual — F01-T08

Data: 13/11/2026. Web no ar pelo `pnpm build` + `pnpm start`, em 1440 × 900, nos temas claro e
escuro (`data-theme="dark"` no `<html>`). Capturas com Chrome headless em `docs/design/home/`.
Pessoa da Sessão: Ana Ribeiro (`ana.ribeiro@empresa.com`).

## Fonte de comparação

O MCP do Figma não estava disponível nesta sessão. A referência usada foi o projeto criado no
Stitch para esta tarefa, documentado em `docs/design/home/README.md`, com as cores, os raios, o
espaçamento e o microtexto de `docs/design-system.md`. A comparação com os frames Home / Vazio e
menu da Pessoa do Figma continua pendente e deve ser refeita quando o Figma estiver acessível
(questão em aberto 9 da spec).

## Estados

| Estado | Captura | O que foi conferido |
| --- | --- | --- |
| Home / Vazio, claro | `home-vazio-claro.png` | Rail `w-rail` em `chrome`, com o bloco "FC" e as linhas Início, DMs, Atividade e Mais em `text-micro`, a ativa em `sidebar-active`; sidebar `w-sidebar` em `sidebar`, área principal em `surface`; linhas de 28 px (`h-7`) com `rounded-item`; workspace em `text-body`/`font-black`; busca em `sidebar-field`; `EmptyState` com quadro de 48 px em `surface-subtle`, título `text-title`/`font-black` em `fg` e descrição `text-small` em `fg-muted` |
| Home / Vazio, escuro | `home-vazio-escuro.png` | os mesmos utilitários com os valores do tema escuro: rail `#121016`, sidebar `#19171d`, página `#1a1d21`, texto `fg` e `fg-muted`, sem `dark:` de cor |
| Menu da Pessoa, claro | `home-menu-claro.png` | menu acima do gatilho, `rounded-card`, `shadow-2`, 240 px; cabeçalho com Avatar `md` (`rounded-item`), nome em `text-body`/`font-black` e e-mail em `text-small`/`fg-muted`; separador em `border-subtle`; item Sair `h-8` em `text-small`, destacado em `sidebar-active` com o foco visível de 2 px |
| Menu da Pessoa, escuro | `home-menu-escuro.png` | os mesmos utilitários no tema escuro: `surface-raised`, borda de `shadow-2`, textos `fg` e `fg-muted`, item destacado em `sidebar-active` |

O foco visível do item Sair na captura é o anel global de `:focus-visible` (2 px em `focus`,
afastado 2 px), como manda o design system: o Radix leva o foco ao primeiro item ao abrir o menu.

## CA1 — casca autenticada com a Pessoa da Sessão

- `GET /` com a Sessão de Ana Ribeiro: `200`, `Cache-Control: no-store`, e "Ana Ribeiro" no corpo.
- O gatilho do menu tem `aria-label="Menu de Ana Ribeiro"`, com o nome vindo de
  `GET /v1/sessions/current` pela verificação cacheada da F01-T06.
- Nenhum item da casca vira link: `document.querySelectorAll("nav a").length` é `0`, e o rail e a
  sidebar não têm `role` de botão.
- A página não faz uma segunda chamada à API: a Home chama `getSession()`, que é a mesma função
  cacheada por renderização que o layout autenticado usa (F01-T06). A revisão do código confere;
  a prova pela tela fica na suíte da F01-T09.

## CA2 e CA4 — menu, Sair e teclado

Conferência com o Chrome headless, em `/`, com a Sessão de Ana Ribeiro:

1. Só um elemento entra na ordem de foco na casca: o gatilho do menu (`Menu de Ana Ribeiro`).
   As linhas do rail e da sidebar são estáticas e não entram no Tab.
2. `Tab` alcança o gatilho; `Enter` abre o menu e leva o foco ao item Sair; as setas percorrem os
   itens; `Enter` em Sair encerra a Sessão e chega a `/entrar`. Nenhuma armadilha de foco.
3. O menu mostra "AR · Ana Ribeiro · ana.ribeiro@empresa.com · Sair".
4. Depois de sair, o cookie `session` não existe mais e uma nova navegação para `/` volta a
   `/entrar`.

O Sair é a Server Action `sair` da F01-T05, sem ação nova: ela apaga o cookie e leva a `/entrar`, e
as outras Sessões da Pessoa continuam valendo (prova da F01-T03).

## CA5 — verificação completa

No contêiner `web`:

```bash
docker compose -f compose.yaml exec -T web pnpm lint
docker compose -f compose.yaml exec -T web pnpm exec tsc --noEmit
docker compose -f compose.yaml exec -T web pnpm build
```

Os três terminam com sucesso. O `build` também é o que serve a web das capturas (`pnpm start`).

## Divergências registradas

- Os frames do Stitch têm uma barra superior, uma ação de compor e um atalho de busca que a
  implementação não tem: são de outras funcionalidades, e o escopo da F01-T08 proíbe rota e
  controle morto na casca.
- O rail não repete o avatar da Pessoa da referência: o menu da Pessoa fica no rodapé da sidebar,
  e o `Rail` não recebe props no plano.
- A fonte da referência do Stitch é Source Sans 3; a implementação usa Lato pelo `next/font`.

## Pendências

- Comparar com os frames Home / Vazio e menu da Pessoa do Figma nos dois temas, quando o Figma
  estiver acessível.
- Provar CA1, CA2 e CA4 na suíte Playwright da F01-T09, com o axe na Home.
