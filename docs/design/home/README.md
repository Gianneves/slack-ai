# Design da Home e do menu da Pessoa

Fonte de referência visual da Home (`/`) e do menu da Pessoa da F01-T08, criada nesta tarefa no
Stitch porque o MCP do Figma não estava disponível na sessão de implementação. O Figma continua
sendo a fonte de design do produto (`docs/design-system.md`); este material é a referência usada
enquanto os frames Home / Vazio e menu da Pessoa não são acessados. Quando o Figma estiver
disponível, esta pasta deve ser comparada com esses frames e atualizada.

## Projeto no Stitch

- Projeto: `projects/15862278223147662347` ("Full Cycle Chat — Home (F01-T08)").
- Design system: `assets/3116255269711270124` ("Full Cycle Chat — Home"), com as cores da casca
  (`chrome`, `sidebar`, `sidebar-*`), a tipografia e a escala de `docs/design-system.md`. O par de
  telas escuras foi gerado com o design system `assets/f033109b47eb4f6fb85c1814715c0521`
  ("Obsidian Flow"), que o Stitch criou a partir da mesma paleta escura.
- Telas:
  - `projects/15862278223147662347/screens/362d314238fb4c77a164836cdbf10bee` — Home / Vazio, tema
    claro.
  - `projects/15862278223147662347/screens/a5c41fc6387e4a359a45481c8a095576` — Home / Vazio com o
    menu da Pessoa aberto, tema claro.
  - `projects/15862278223147662347/screens/2bce0cb2203740e78303e3cb22fc0d60` — Home / Vazio, tema
    escuro.
  - `projects/15862278223147662347/screens/a44cd1ffde7b4bfba838d5671be9f0d1` — Home / Vazio com o
    menu da Pessoa aberto, tema escuro.

O design system do Stitch usa Source Sans 3 como substituta da Lato: o Stitch não oferece Lato, e a
Lato é a fonte do produto pelo `next/font/google`. As cores, os raios, o espaçamento e os textos
foram fixados no prompt a partir de `docs/design-system.md`.

## Microtexto aprovado

| Onde | Texto |
| --- | --- |
| Workspace, no topo da sidebar | Full Cycle Chat |
| Busca estática | Buscar no Full Cycle Chat |
| Linhas do rail | Início · DMs · Atividade · Mais |
| Rótulo de seção | Canais · Mensagens diretas |
| Linhas de canal | `#` geral · `#` produto · `#` suporte |
| Mensagens diretas | Bruno Lima · Carla Souza |
| Estado vazio | Bem-vindo ao Full Cycle Chat |
| Apoio do estado vazio | Escolha uma conversa na barra lateral para começar. |
| Nome acessível do gatilho do menu | Menu de `<nome da Pessoa>` |
| Cabeçalho do menu | Nome da Pessoa e e-mail |
| Item do menu | Sair |

O nome e o e-mail no menu vêm da Pessoa da Sessão, nunca de texto fixo. Os textos da casca ficam
em `apps/web/src/app/components/workspace-nav/`, e o menu, em
`apps/web/src/app/components/user/user-menu.tsx`.

## Capturas

As capturas foram feitas da implementação, em 1440 × 900, com Chrome headless sobre
`pnpm build` + `pnpm start`, e ficam nesta pasta:

| Arquivo | Estado |
| --- | --- |
| `home-vazio-claro.png` | Home / Vazio, tema claro |
| `home-vazio-escuro.png` | Home / Vazio, tema escuro (`data-theme="dark"`) |
| `home-menu-claro.png` | Menu da Pessoa aberto, tema claro |
| `home-menu-escuro.png` | Menu da Pessoa aberto, tema escuro |

## Limitações aceitas

- Os frames do Stitch acrescentam uma barra superior, uma ação de compor e um atalho de busca que
  não existem na implementação: são de outras funcionalidades, e o escopo da F01-T08 proíbe rota e
  controle morto na casca. Os textos, as cores, os raios, a tipografia e a elevação das duas telas
  batem com a referência.
- O menu tem 240 px (`w-60`), a largura da referência para caber dentro do padding da sidebar.
- O rail não repete o avatar da Pessoa da referência: o menu da Pessoa fica no rodapé da sidebar, e
  o `Rail` não recebe props no plano.
- A fonte da referência do Stitch é Source Sans 3; a implementação usa Lato pelo `next/font`.
- A comparação com os frames Home / Vazio e menu da Pessoa do Figma continua pendente (questão em
  aberto 9 da spec).
