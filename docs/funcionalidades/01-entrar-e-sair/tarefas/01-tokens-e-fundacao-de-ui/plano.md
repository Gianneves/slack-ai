# Plano da F01-T01: Tokens e fundação de UI

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Dado o `globals.css` entregue pela tarefa, quando quem revisa compara cada bloco com as
seções "Cores semânticas", "Tipografia", "Raios", "Elevação", "Tamanhos do shell" e "Movimento" do
design system, então os nomes das variáveis e os valores batem um a um, nos temas claro e escuro,
sem token faltando, sem token extra e sem valor reinterpretado. Os blocos de `@theme inline`,
`body`, `:focus-visible` e `prefers-reduced-motion` também são conferidos contra o documento.

### CA2

**Marca:** revisão humana

**Cenário:** Dado o `globals.css` e o `layout.tsx` entregues pela tarefa, quando quem revisa busca
nos dois arquivos por hex, `rgb(`, `hsl(`, valores arbitrários de cor (`bg-[#…]`) e classes da
paleta padrão do Tailwind (`zinc-`, `black/`, `white/`, `bg-black/[.06]` e afins), então as únicas
ocorrências de hex estão nos valores literais das declarações de token do `globals.css`; no
`layout.tsx` não há cor solta.

### CA3

**Marca:** revisão humana

**Cenário:** Dado a web no ar com o `globals.css` novo, quando quem revisa coloca
`data-theme="dark"` no `<html>` pelo navegador e percorre a página, então superfícies, texto,
bordas, sidebar e elevação passam aos valores do bloco escuro; ao remover o atributo, voltam aos do
claro. Nenhum código da aplicação escreve `data-theme` nesta funcionalidade: a escolha é da F02.

### CA4

**Marca:** revisão humana

**Cenário:** Dado a web no ar, quando quem revisa navega com Tab pelos elementos focáveis da página,
então cada foco aparece com contorno de 2 px em `--focus` afastado 2 px, sem nenhum `outline: none`
que o apague.

### CA5

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web`, quando quem revisa roda `pnpm lint`,
`pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com sucesso, sem erro nem aviso
tratado como falha.

## Contrato

O contrato não muda.

## Verificação do contrato

Como a tarefa não cria, muda nem remove rota, evento ou tabela, não há item do contrato a provar.

## Decisões

- Copiar os tokens para o `globals.css` exatamente como o design system os resolve, sem renomear
  nem recalcular valores: o documento é a fonte e o CA1 exige igualdade de nomes e valores.
- O `@custom-variant dark` e o bloco `:root[data-theme="dark"]` entram no CSS, mas a aplicação não
  escreve `data-theme` na F01; o atributo é provado à mão no CA3, e a escolha do tema é da F02.
- Espaçamento, camadas e breakpoints não ganham declaração CSS: a escala de espaçamento é a padrão
  do Tailwind e os valores de `z/*` e `breakpoint/*` são só referência no Figma. Criar variáveis
  para eles contrariaria o design system.
- `:focus-visible` e `prefers-reduced-motion` entram no `globals.css`, porque o CA4 e o escopo de
  movimento os exigem mesmo não estando na lista de seções do CA1.
- Lato entra com os pesos 400, 700 e 900 nos estilos normal e itálico, na variável `--font-lato`,
  como no exemplo do design system; a mono fica na pilha de sistema e Geist/Geist_Mono saem.
- O `<html>` mantém `h-full antialiased` e passa a `lang="pt-BR"`; o `<body>` fica só com
  `min-h-full`, sem o `flex flex-col` do esqueleto, que existia para centralizar a página de
  exemplo.
- Os metadados do layout (`title`, `description`) não mudam nesta tarefa: são da Home e do Figma, e
  a T08 é dona do conteúdo da página.
- O `src/app/page.tsx` não é tocado: o esqueleto é substituído inteiro na T08.
- Nenhuma dependência nova: `next/font/google` já vem com o Next e Tailwind, TypeScript e ESLint já
  estão instalados.
- O CA2 vale só para os arquivos desta tarefa, `globals.css` e `layout.tsx`: o `page.tsx` do
  esqueleto tem `zinc-*` e hex, mas é substituído inteiro na T08, e reescrevê-lo agora duplicaria a
  T08 e criaria texto sem base no Figma.
- A correção da tabela "Estado atual" do design system (questão em aberto 10 da spec) fica para a
  T02: lá os componentes e as bibliotecas passam a existir e a tabela inteira fica verdadeira; a
  T01 não escreve documento.

## Arquivos e interfaces

- `apps/web/src/app/globals.css`: substitui o esqueleto. Passa a ter `@import "tailwindcss"`,
  `@custom-variant dark`, `:root` com as cores semânticas, `--shape-*` e `--size-*`,
  `:root[data-theme="dark"]` com as sobrescritas, `@theme inline` com os utilitários de cor,
  sombra, fonte, raio e tamanho, `@theme` com a escala de texto e as animações, a base do `body`,
  o `:focus-visible` global e o bloco de `prefers-reduced-motion`. Interface: utilitários como
  `bg-surface`, `text-fg-muted`, `border-border-subtle`, `bg-primary`, `rounded-control`,
  `w-rail`, `h-header`, `shadow-2`, `text-body` e `animate-pop-in`.
- `apps/web/src/app/layout.tsx`: troca `Geist`/`Geist_Mono` por `Lato` de `next/font/google` na
  variável `--font-lato`, com `subsets: ["latin"]`, pesos 400/700/900 e estilos normal e itálico;
  `<html lang="pt-BR" className={`${lato.variable} h-full antialiased`}>`; `<body
  className="min-h-full">`. Assinatura `LayoutProps<"/">` e `metadata` ficam como estão.
- `apps/web/src/app/page.tsx`: inalterado.
- `apps/web/package.json`: inalterado.

## Testes existentes que mudam

Nenhum. A web ainda não tem suíte de testes; o Playwright entra na T09.

## Mudança de dados

Nenhuma.

## Documentos atualizados

Nenhum. O design system já descreve os tokens entregues; a correção da seção "Estado atual" é a
decisão em aberto acima.
