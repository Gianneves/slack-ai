# Design da tela de entrar

Fonte de referência visual da tela `/entrar` da F01-T07, criada nesta tarefa no Stitch porque o
MCP do Figma não estava disponível na sessão de implementação. O Figma continua sendo a fonte de
design do produto (`docs/design-system.md`); este material é a referência usada enquanto os frames
Login não são acessados. Quando o Figma estiver disponível, esta pasta deve ser comparada com os
frames Login e atualizada.

## Projeto no Stitch

- Projeto: `projects/5506782098923117769` ("Full Cycle Chat — Login (F01-T07)").
- Design system: `assets/7428085313007761961` ("Full Cycle Chat").
- Telas:
  - `projects/5506782098923117769/screens/282df444b74847eaa70a6217e2979bb1` — padrão, tema claro.
  - `projects/5506782098923117769/screens/1e69c7ae2d624b67bbd07e0486cf31ee` — credencial inválida.
  - `projects/5506782098923117769/screens/e0eca0891d82410084de19233ed8247c` — padrão, tema escuro.
  - `projects/5506782098923117769/screens/cd26cd1114644cd8beee112129cc92c1` — bloqueio.

O design system do Stitch usa Source Sans 3 como substituta da Lato: o Stitch não oferece Lato, e a
Lato é a fonte do produto pelo `next/font/google`. As cores, raios, espaçamento e textos foram
fixados no prompt a partir de `docs/design-system.md`.

## Microtexto aprovado

| Estado | Texto |
| --- | --- |
| Título | Entrar no Full Cycle Chat |
| Apoio | Use o e-mail e a senha da conta criada pela empresa. |
| Rótulos | E-mail · Senha |
| Placeholders | pessoa@empresa.com · Sua senha |
| Botão | Entrar |
| Credencial inválida e e-mail sem conta | E-mail ou senha incorretos. Verifique e tente de novo. |
| Validação | Informe um e-mail válido e a senha. |
| Bloqueio | Muitas tentativas. Tente de novo em `<tempo>`. |
| API indisponível | Não foi possível entrar agora. Tente de novo em instantes. |

As frases ficam em `LOGIN_MESSAGES`, em `apps/web/src/app/components/auth/login-form.tsx`.

## Capturas

As capturas foram feitas da implementação, em 1440 × 900, com Chrome headless, e ficam nesta
pasta:

| Arquivo | Estado |
| --- | --- |
| `entrar-padrao-claro.png` | Padrão, tema claro |
| `entrar-padrao-escuro.png` | Padrão, tema escuro (`data-theme="dark"`) |
| `entrar-carregando.png` | Envio em andamento, com `Spinner` e botão desabilitado |
| `entrar-credencial-invalida.png` | Credencial inválida |
| `entrar-validacao.png` | Validação da API |
| `entrar-bloqueio.png` | Bloqueio por tentativas, com o tempo que falta |
| `entrar-api-indisponivel.png` | API fora no envio |
| `home-apos-entrar.png` | Home depois de entrar com credencial válida |

O aviso "N" no canto inferior esquerdo é o indicador do `next dev`, não faz parte da tela.

## Limitações aceitas

- O cartão tem 384 px (`max-w-sm`), e não os 400 px do Stitch: o design system proíbe valor
  arbitrário e a escala do Tailwind não tem 400 px.
- O título quebra em duas linhas no cartão de 384 px, como no Stitch.
- No tema escuro, o fundo da página é `surface-subtle` (#222529), igual ao do cartão; o cartão se
  destaca pela borda de `shadow-3`. O Stitch usa #1a1d21 na página, mas não há token que dê
  #1a1d21 no escuro e #f8f8f8 no claro sem `dark:`, que o design system proíbe para cor.
- Depois de um erro, os campos voltam vazios: a Server Action devolve só o status, sem o e-mail
  digitado, e mudar o resultado discriminado está fora desta tarefa.
