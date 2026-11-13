# Validação visual — F01-T07

Data: 13/11/2026. Web no ar pelo `pnpm dev`, em 1440 × 900, no tema claro e no escuro
(`data-theme="dark"` no `<html>`). Capturas com Chrome headless em `docs/design/login/`.

## Fonte de comparação

O MCP do Figma não estava disponível nesta sessão. A referência usada foi o design criado no
Stitch para esta tarefa, documentado em `docs/design/README.md`, com as cores, os raios, o
espaçamento e o microtexto de `docs/design-system.md`. A comparação com os frames Login do Figma
continua pendente e deve ser refeita quando o Figma estiver acessível.

## Estados

| Estado | Captura | O que foi conferido |
| --- | --- | --- |
| Padrão, claro | `entrar-padrao-claro.png` | cartão `surface-raised` com `rounded-panel` e `shadow-3` sobre `surface-subtle`; título `display` 28/34 em `font-black`; apoio `body` em `fg-muted`; campos `h-9`, borda `border-strong`, raio `control`; botão `lg` `primary` |
| Padrão, escuro | `entrar-padrao-escuro.png` | mesmos utilitários, com os valores do tema escuro; cartão delimitado pela borda de `shadow-3`; textos `fg` e `fg-muted`; botão `primary` |
| Carregando | `entrar-carregando.png` | `Spinner` à esquerda do texto "Entrar", botão desabilitado com `opacity-50` e `aria-busy="true"`, campos mantidos |
| Credencial inválida | `entrar-credencial-invalida.png` | uma única linha de alerta em `danger-fg`/`text-small`; os dois campos com borda `danger` (`aria-invalid`); botão ativo |
| Validação | `entrar-validacao.png` | mesma composição do erro de credencial, com a frase de validação |
| Bloqueio | `entrar-bloqueio.png` | alerta abaixo da senha com o tempo vindo do `Retry-After` ("10 minutos" na captura); campos com borda normal e botão ativo |
| API indisponível | `entrar-api-indisponivel.png` | alerta de indisponibilidade mantendo o formulário, sem porta de erro |
| Porta de erro, claro | `entrar-porta-de-erro-claro.png` | `SessionError` da F01-T06 centralizado, ícone em `surface-subtle`, título `title`/`font-black`, link "Tentar de novo" em `secondary`; sem o formulário |
| Porta de erro, escuro | `entrar-porta-de-erro-escuro.png` | os mesmos utilitários no tema escuro, com texto e borda dos tokens |
| Home depois de entrar | `home-apos-entrar.png` | destino do login, com o nome da Pessoa da verificação |

## Divergências registradas

- Cartão de 384 px (`max-w-sm`), e não 400 px: a escala do Tailwind não tem 400 px e o design
  system proíbe valor arbitrário. O título quebra em duas linhas.
- Tema escuro com fundo de página `surface-subtle` (#222529), igual ao cartão; a separação fica
  pela borda de `shadow-3`. Não há token para #1a1d21 na página escura e #f8f8f8 na clara sem
  `dark:` de cor, que o design system proíbe.
- A fonte da referência do Stitch é Source Sans 3; a implementação usa Lato pelo `next/font`.
- Depois de um erro, os campos voltam vazios. O e-mail digitado não é devolvido pela Server Action
  da F01-T05, e mudar `EntrarResult` está fora desta tarefa.
- O aviso "N" no canto inferior esquerdo é o indicador do `next dev`.

## Pendências

- Comparar com os frames Login do Figma nos dois temas, quando o Figma estiver acessível.
- Rodar o axe na tela: a dependência entra com a suíte Playwright da F01-T09.
