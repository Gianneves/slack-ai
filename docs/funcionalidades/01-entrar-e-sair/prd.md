# F01 — Entrar e sair

Status: pronto

- **Funcionalidade:** F01
- **Roadmap:** [roadmap](../../roadmap.md)
- **Product brief:** [product brief](../../product-brief.md)
- **Glossário:** [GLOSSARY.md](../../../GLOSSARY.md)

## Problema e objetivo

As contas são criadas pela empresa fora do produto, e cada pessoa precisa de um caminho seguro para
abrir o workspace. Sem isso, o chat não sabe quem é quem, e uma conta sem controle de acesso expõe
as conversas a qualquer pessoa. Também não basta entrar uma vez: recarregar a página, abrir outra
aba ou voltar no dia seguinte não pode exigir a senha de novo. E, quando alguém sai ou perde o
acesso, a sessão aberta precisa deixar de valer.

O objetivo desta funcionalidade é dar à pessoa um jeito de entrar com a conta criada pela empresa,
continuar na sessão no navegador sem repetir a senha e sair quando quiser, com a garantia de que
uma sessão revogada ou vencida deixa de valer.

## Rastreabilidade

| Origem no product brief | O que esta funcionalidade entrega |
| --- | --- |
| "Escopo do MVP", item 1 | Entrar com e-mail e senha em uma conta criada pela empresa, com a sessão válida para o navegador todo. |
| "Requisitos não funcionais e restrições", linha "Sessão" | Sessão revogável, sem credencial acessível ao navegador. |
| "Fora de escopo" | Cadastro, convite de pessoas, papéis e permissões, login corporativo e celular continuam fora desta funcionalidade. |

## Fluxos

1. **Entrar com credencial válida.** A pessoa abre o produto, informa o e-mail e a senha da conta
   criada pela empresa e chega à tela inicial do workspace.
2. **Voltar ao que pedia sessão.** Quem foi levada a entrar por causa de uma página que exigia
   sessão volta a essa página depois de entrar. Sem página pedida, chega à tela inicial.
3. **Credencial inválida.** Com e-mail ou senha errados, a pessoa continua na tela de entrar, vê
   uma única mensagem de credencial inválida e pode tentar de novo. A tela não revela se o e-mail
   tem conta.
4. **Muitas tentativas.** Depois de cinco tentativas erradas em 15 minutos, o e-mail fica bloqueado
   por 15 minutos. A pessoa vê quanto tempo falta para tentar de novo; nesse período, qualquer
   tentativa é recusada, inclusive com a senha certa, e novas tentativas não prolongam o bloqueio.
   Passado o prazo, a pessoa entra com a credencial certa e a contagem é apagada.
5. **Sessão que continua.** Enquanto usa o chat dentro de 30 dias, a pessoa continua na sessão. Isso
   vale ao recarregar a página, abrir outra aba ou fechar e reabrir o navegador. Depois de 30 dias
   sem uso, ela precisa entrar de novo.
6. **Sessão vencida ou revogada.** Na próxima ação, a pessoa é recusada e levada a entrar de novo,
   inclusive se a sessão for revogada com o chat aberto. Sessão vencida e sessão revogada têm o
   mesmo comportamento.
7. **Falha ao verificar a sessão.** Quando não é possível verificar a sessão por falha de rede ou
   indisponibilidade, a pessoa vê uma mensagem de que não foi possível verificar a sessão, com a
   opção de tentar de novo, e não é levada a entrar.
8. **Sair.** No menu da pessoa, a opção de sair encerra a sessão daquele navegador e leva à tela de
   entrar. As outras sessões da mesma pessoa continuam valendo.
9. **Já está na sessão.** Quem abre a tela de entrar com uma sessão válida vai direto para a tela
   inicial.

## Histórias de usuário

1. Como pessoa com conta criada pela empresa, quero entrar com e-mail e senha para acessar o
   workspace.
2. Como pessoa com conta no workspace, quero que meu e-mail seja protegido contra tentativas
   repetidas de senha para que ninguém consiga adivinhá-la.
3. Como pessoa que usa o chat com frequência, quero continuar na sessão por até 30 dias sem uso para
   não precisar entrar de novo a cada visita.
4. Como pessoa, quero sair do chat para encerrar a sessão naquele navegador.
5. Como pessoa, quero que uma sessão revogada ou vencida deixe de valer na hora para que ninguém use
   minha conta depois que o acesso foi cortado.
6. Como pessoa que foi levada a entrar por causa de uma página, quero voltar a essa página depois de
   entrar para não procurar de novo o que estava fazendo.
7. Como pessoa, quero saber quando não for possível verificar minha sessão e poder tentar de novo
   para não ser desconectada por uma falha passageira.
8. Como pessoa que já está na sessão, quero ir direto para a tela inicial ao abrir a tela de entrar
   para não repetir a senha sem motivo.

## Critérios de aceite

- A pessoa entra com o e-mail e a senha de uma conta criada pela empresa e chega à tela inicial do
  workspace.
- A pessoa entra com o e-mail digitado com espaços nas pontas ou letras maiúsculas, e o mesmo
  e-mail é reconhecido.
- Credencial errada mantém a pessoa na tela de entrar, mostra uma mensagem de credencial inválida e
  permite tentar de novo.
- E-mail sem conta e senha errada recebem a mesma mensagem, e a tela não revela se o e-mail tem
  conta.
- Cinco tentativas erradas em 15 minutos bloqueiam o e-mail por 15 minutos, e a pessoa vê quanto
  tempo falta.
- Durante o bloqueio, qualquer tentativa é recusada, inclusive com a senha certa, e novas
  tentativas não estendem o bloqueio.
- Passado o bloqueio, a pessoa entra com a credencial certa, e a contagem de tentativas é apagada.
- A sessão vale para todas as abas e páginas do produto naquele navegador.
- A pessoa continua na sessão ao recarregar a página, abrir outra aba ou fechar e reabrir o
  navegador.
- Usar o chat dentro de 30 dias mantém a sessão; depois de 30 dias sem uso, a pessoa precisa entrar
  de novo.
- Sair encerra a sessão daquele navegador e leva à tela de entrar; as outras sessões da mesma pessoa
  continuam valendo.
- Uma sessão revogada fora do produto deixa de valer na próxima ação da pessoa, inclusive com o
  chat aberto.
- Uma sessão vencida tem o mesmo comportamento de uma sessão revogada.
- Quem é levada a entrar por causa de uma página que exigia sessão volta a essa página depois de
  entrar; sem página pedida, chega à tela inicial.
- Quem já tem sessão válida e abre a tela de entrar vai direto para a tela inicial.
- Quando não é possível verificar a sessão por falha de rede ou indisponibilidade, a pessoa vê uma
  mensagem de que não foi possível verificar a sessão, com a opção de tentar de novo, e não é levada
  a entrar.
- A redefinição de senha fora do produto encerra todas as sessões abertas daquela pessoa.

## Fora de escopo

- Cadastro, convite de pessoas, criação de contas e tela de papéis e permissões: ficam na Fase 2,
  nas funcionalidades F13 e F14, e no "Fora de escopo" do
  [product brief](../../product-brief.md).
- Recuperação e redefinição de senha pelo próprio produto: as contas e as senhas continuam sendo
  tratadas fora do produto, como no "Fora de escopo" do
  [product brief](../../product-brief.md).
- Login corporativo (SSO), que está no "Fora de escopo" do
  [product brief](../../product-brief.md).
- Tela para a pessoa ver e encerrar as outras sessões da própria conta: a revogação continua sendo
  feita fora do produto.
- Opção de "lembrar de mim" ou de escolher a duração da sessão: a duração é de 30 dias sem uso.
- Edição de perfil, presença e tema, que pertencem a F02.
- Conteúdo e navegação do workspace, que pertencem às demais funcionalidades do roadmap.
- Celular e tablet, que estão no "Fora de escopo" do
  [product brief](../../product-brief.md).

## Dependências

Nenhuma, igual ao [roadmap](../../roadmap.md).

## Questões em aberto

- [ ] Como a pessoa recebe a senha inicial de uma conta criada pela empresa, e se o primeiro acesso
      exige troca de senha. Trava a história 1 no uso real; o roteiro de aceite usa uma conta criada
      para o teste.
- [ ] O que conta como uso para manter a sessão viva: abrir uma página, interagir com o chat ou
      apenas manter a aba aberta. Trava a história 3 e o critério de 30 dias sem uso.
