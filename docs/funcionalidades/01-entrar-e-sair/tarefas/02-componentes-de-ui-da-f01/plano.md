# Plano da F01-T02: Componentes de UI da F01

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Dado os sete arquivos de `apps/web/src/app/components/ui/` entregues pela tarefa,
quando quem revisa compara cada um com o component set do Figma e com as seções "Componentes",
"Estados de interação" e "Comportamentos registrados no Figma" do design system, então cada
variante, tamanho e estado do desenho existe no código com o mesmo nome, e nenhum componente
inventa variante, tamanho ou estado que o Figma não tem. Confere: `Button` com `primary`,
`secondary`, `ghost`, `danger` e `link`, tamanhos `sm`/`md`/`lg` (28/36/44 px), `icon` e `loading`;
`Input` com `h-9`, borda `strong`, placeholder `fg-muted`, foco e inválido; `Field` com rótulo,
controle e dica ou erro; `Spinner` girando com a duração do design system; `Avatar` com `xs`, `sm`,
`md`, `lg` e `xl`; `EmptyState` com o quadro de 48 e `compact`; `DropdownMenu` com item e separador.

### CA2

**Marca:** revisão humana

**Cenário:** Dado o `Input` e o `Field` entregues pela tarefa, quando o controle recebe
`aria-invalid`, então o `Input` pinta a borda com `--danger` e, com foco, o anel com
`ring-danger/25`; sem `aria-invalid`, o foco é a borda `--focus` com anel de 4 px em
`ring-focus/30`, e o contorno global do `:focus-visible` não aparece no campo. O `Field`, na
presença de `error`, mostra a mensagem com `text-danger-fg` e `role="alert"`, ligada ao controle por
`aria-describedby`. Quem revisa confere as classes condicionais de `aria-invalid:` nos dois arquivos
e que o estado não é uma variante (`invalid` não é prop de aparência).

### CA3

**Marca:** revisão humana

**Cenário:** Dado um `Button` com `loading`, quando ele é renderizado, então o `Spinner` ocupa o
lugar do ícone, o texto continua visível, o tamanho não muda e o botão fica desabilitado
(`disabled` e `opacity-50`); um clique não dispara a ação. Sem `loading`, o ícone opcional volta e o
botão obedece ao `disabled` de fora. Quem revisa lê o componente e, se precisar, o renderiza
isolado.

### CA4

**Marca:** revisão humana

**Cenário:** Dado o `DropdownMenu` aberto, quando quem revisa o percorre com Tab, setas, Home, End,
digitação e Esc, então o Radix mantém o comportamento de teclado (setas percorrem, Home/End vão aos
extremos, digitar busca, Enter e Espaço ativam, Esc fecha e o foco volta ao gatilho), e o item
destacado usa `bg-sidebar-active text-sidebar-on-active`. O componente não reimplementa teclado nem
intercepta as teclas do Radix.

### CA5

**Marca:** revisão humana

**Cenário:** Dado o `Avatar` e o `EmptyState`, quando renderizados, então o avatar mostra no máximo
duas iniciais do nome em `font-black` sobre uma das cores `avatar-1` a `avatar-6`, com a mesma
pessoa sempre na mesma cor; `xs` e `sm` usam `text-micro`, e os tamanhos são xs 20, sm 24, md 36,
lg 48 e xl 96. O `EmptyState` põe o ícone num quadro de 48, com título, descrição e ação opcionais,
e `compact` reduz o espaçamento vertical para `py-6`.

### CA6

**Marca:** revisão humana

**Cenário:** Dado os arquivos que a tarefa cria, quando quem revisa procura hex, `rgb(`, `hsl(`,
valores arbitrários (`bg-[#…]`, `text-[rgb(…)]`), classes da paleta padrão do Tailwind (`zinc-`,
`black/`, `white/`) e `dark:` usado para cor, então não há nenhuma ocorrência; toda cor sai de um
utilitário semântico (`bg-surface`, `text-fg-muted`, `border-border-strong`, `bg-sidebar-active` e
afins).

### CA7

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web`, quando quem revisa roda `pnpm lint`, `pnpm exec tsc --noEmit`
e `pnpm build`, então os três terminam com sucesso, sem erro nem aviso tratado como falha.

## Contrato

O contrato não muda.

## Verificação do contrato

Como a tarefa não cria, muda nem remove rota, evento ou tabela, não há item do contrato a provar.

## Decisões

- Instalar no contêiner `web`, com `pnpm add`, as cinco bibliotecas da tarefa: `lucide-react`,
  `radix-ui`, `class-variance-authority`, `clsx` e `tailwind-merge`. São as que o primeiro
  componente precisa e as que o design system já prevê. O `sonner` não entra: nenhum componente da
  F01 usa toast, e o design system o deixa "a instalar".
- `cn` fica em `src/app/utils/cn.ts`, combinando `clsx` e `twMerge`, como a seção "Stack de
  interface" manda. Os componentes usam `cn` só para mesclar a `className` de fora.
- O `radix-ui` é o pacote guarda-chuva: `import { DropdownMenu } from "radix-ui"`. O `"use client"`
  fica só em `dropdown-menu.tsx`, o único que embrulha Radix; os outros seis nascem Server
  Components (`apps/web/AGENTS.md`, "Server Components").
- `Button` segue o exemplo do design system: `buttonVariants` em CVA com `variant` (`primary`,
  `secondary`, `ghost`, `danger`, `link`) e `size` (`sm`, `md`, `lg`), mais `icon` (`LucideIcon`),
  `loading` e as props nativas de `<button>`. `disabled={disabled || loading}`, e o `Spinner`
  substitui o ícone sem tirar o texto. As classes exatas saem do Figma na implementação; o exemplo
  é o contrato da API.
- O estado inválido é o atributo `aria-invalid` no controle, não uma variante. O `Input` aplica as
  classes `aria-invalid:` de borda e anel; o `Field` recebe `label`, `htmlFor`, `hint`, `error` e
  `children`, e, com `error`, renderiza a mensagem com id `<htmlFor>-error`, `role="alert"` e
  `text-danger-fg`. Quem usa o `Field` liga o controle ao texto com `aria-invalid` e
  `aria-describedby`, porque contexto do React não atravessa Server Components.
- O foco de campo da seção "Estados de interação" substitui o contorno global: o `Input` usa borda
  `--focus` e anel de 4 px em `ring-focus/30` e suprime o `outline` global só com
  `focus-visible:outline-hidden`, que preserva o contorno no modo de alto contraste.
- `Spinner` tem `size` `sm`/`md` (16 e 24 px), com `sm` como padrão, porque ele entra no lugar do
  ícone, cujos tamanhos do design system são 16, 18 e 24. É decorativo (`aria-hidden`): nos
  controles da F01 o texto permanece ao lado. As medidas finais são conferidas no Figma.
- `Avatar` é só de iniciais, porque não há foto no MVP: recebe `name` e `size`, e a cor sai de um
  hash estável do nome entre `avatar-1` e `avatar-6`, para a mesma pessoa manter a cor entre
  renders. As iniciais são a primeira letra do primeiro e do último nome, no máximo duas.
- `EmptyState` recebe `icon` (`LucideIcon`), `title`, `description` e `action` opcionais, e
  `compact`; o quadro do ícone é `size-12` (48 px). O restante da composição sai do Figma.
- `DropdownMenu` reexporta `Root`, `Trigger`, `Portal`, `Content`, `Item` e `Separator` do Radix com
  o visual do design system: item em `h-8` e destacado por
  `data-[highlighted]:bg-sidebar-active data-[highlighted]:text-sidebar-on-active`; separador com
  `my-2` e 1 px. O teclado é o do Radix.
- Não há `index.ts` em `ui/`: a importação é pelo arquivo do componente, como a seção "Organização
  no código" nomeia os arquivos.
- A tabela "Estado atual" do design system é corrigida nesta tarefa, como a T01 decidiu, mas só
  nas linhas que a T02 deixa verdadeiras: "Componentes" passa a listar os sete primitivos
  entregues, e "Telas" passa a dizer que nenhuma tela da F01 existe ainda, porque elas chegam na
  T07 e na T08. "Tokens" e "Bibliotecas" já ficam verdadeiras e não mudam. A correção entra no fim
  da implementação, porque a tabela é uma foto do estado, não uma regra.

## Arquivos e interfaces

- `apps/web/package.json` e `apps/web/pnpm-lock.yaml`: entram `lucide-react`, `radix-ui`,
  `class-variance-authority`, `clsx` e `tailwind-merge`.
- `apps/web/src/app/utils/cn.ts`: `export function cn(...inputs: ClassValue[]): string`.
- `apps/web/src/app/components/ui/button.tsx`: `buttonVariants` (CVA), `Button` e `ButtonProps`
  (`variant`, `size`, `icon`, `loading` e `<button>`), como o exemplo do design system.
- `apps/web/src/app/components/ui/input.tsx`: `Input` e `InputProps` (`<input>`), com foco de campo
  e `aria-invalid`.
- `apps/web/src/app/components/ui/field.tsx`: `Field` e `FieldProps` (`label`, `htmlFor`, `hint`,
  `error`, `children`), com rótulo, dica e erro ligados por `htmlFor`/id.
- `apps/web/src/app/components/ui/spinner.tsx`: `Spinner` e `SpinnerProps` (`size`, `className`),
  decorativo.
- `apps/web/src/app/components/ui/avatar.tsx`: `Avatar` e `AvatarProps` (`name`, `size`,
  `className`), com iniciais e cor estável.
- `apps/web/src/app/components/ui/empty-state.tsx`: `EmptyState` e `EmptyStateProps` (`icon`,
  `title`, `description`, `action`, `compact`, `className`).
- `apps/web/src/app/components/ui/dropdown-menu.tsx`: `DropdownMenu`, `DropdownMenuTrigger`,
  `DropdownMenuContent`, `DropdownMenuItem` e `DropdownMenuSeparator`, embrulhando o Radix.
- Nenhum arquivo de `src/app/components/` fora de `ui/` e nenhuma rota: `session/`, `auth/`,
  `user/` e `workspace-nav/` ficam para as tarefas 06, 07 e 08.

## Testes existentes que mudam

Nenhum. A web ainda não tem suíte de testes; o Playwright entra na T09.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/design-system.md`, seção "Estado atual": a tabela passa a refletir o que existe no código
  depois da T02. A correção é feita no fim da implementação e não no commit de plano, porque a
  tabela é uma foto do estado, não uma regra. Nenhum token, seção de componente ou linha de "Stack
  de interface" muda.
