# Validação visual da F01-T02

Medição feita em 11/11/2026, com a web no ar, para os critérios CA2, CA3, CA4 e CA5. Os
componentes foram renderizados numa página temporária, que foi removida antes do commit; os valores
abaixo são do `getComputedStyle` do Chromium headless.

O Figma não estava acessível nesta sessão, então a comparação visual com os component sets do
arquivo continua sendo a revisão humana do CA1. O que dava para provar pelo design system foi
conferido contra as seções "Componentes", "Estados de interação" e "Comportamentos registrados no
Figma".

## CA2 — inválido e foco em campo

| Estado | Borda | Anel |
| --- | --- | --- |
| Foco normal | `rgb(29, 155, 209)` (`--focus`) | 4 px em `--focus` a 30% |
| Inválido | `rgb(224, 30, 90)` (`--danger`) | 4 px em `--danger` a 25% com foco |
| Erro do `Field` | — | texto `rgb(192, 19, 67)` (`--danger-fg`), 13 px |

O contorno global do `:focus-visible` não aparece no campo nos dois estados: o `outline` computado
fica com `style: none`.

## CA3 — carregando

O `Button` com `loading` renderiza o `Spinner` de 16 px no lugar do ícone, mantém o texto
("Entrando"), fica `disabled` e preserva a altura de 36 px do tamanho `md`.

## CA4 — menu

O item com `data-highlighted` fica com `background: rgb(18, 100, 163)` (`--sidebar-active`) e
`color: rgb(255, 255, 255)` (`--sidebar-on-active`), em 32 px de altura e 13 px de texto. O teclado
é o do Radix (setas, Home/End, digitação, Enter/Espaço e Esc), sem reimplementação.

## CA5 — avatar e estado vazio

| Item | Medida |
| --- | --- |
| Avatar `xs` | 20 px, 10 px de texto, raio 6 px, iniciais "AS" |
| Avatar | fundo `rgb(97, 31, 105)` (`--avatar-1`) com texto branco |
| Quadro do `EmptyState` | 48 × 48 px |

## CA6 e CA7

A busca por hex, `rgb(`, `hsl(`, valores arbitrários, paleta padrão do Tailwind e `dark:` de cor nos
arquivos da tarefa não encontra ocorrência. `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`
passam no contêiner `web`.
