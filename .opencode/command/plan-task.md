---
description: Cria o plano de uma tarefa antes do código e o commita sozinho no commit de plano
---

Sua tarefa é criar o plano de uma tarefa do Full Cycle Chat, antes de qualquer código, e commitá-lo
sozinho no commit de plano depois da aprovação do usuário. Esta skill não implementa a tarefa.

## Fonte

A tarefa é indicada em $ARGUMENTS, por `F<NN>-T<NN>` (`F01-T02`), pelo caminho da pasta ou pelo
título. Se $ARGUMENTS estiver vazio, leia `docs/roadmap.md` e a pasta da funcionalidade e pergunte
qual tarefa será planejada.

Antes de escrever, leia:

- `docs/funcionalidades/<num-funcionalidade>-<titulo>/spec.md`, que é a fonte das decisões de
  implementação e de teste da funcionalidade;
- `docs/funcionalidades/<num-funcionalidade>-<titulo>/tarefas/<NN>-<titulo>/tarefa.md`, que é a
  fonte do escopo da tarefa;
- o `docs/hld.md`, o `docs/lld.md` e as ADRs em `docs/adr/` citadas pela spec e pela tarefa;
- o `docs/design-system.md`, se a tarefa tocar interface;
- o `AGENTS.md` da raiz e o `AGENTS.md` do projeto afetado, para comandos e práticas;
- as rules de `.opencode/rules/` que valem para os arquivos da tarefa.

Se a spec ou a tarefa não existir, pare e avise o usuário: o plano nasce da spec.

## Regras

- **Nada de código nesta skill.** O plano descreve o que será feito; a implementação vem depois, na
  tarefa.
- **O plano é congelado no commit.** Depois do commit de plano, o `plano.md` não muda: só o usuário
  o descongela, e uma decisão errada é corrigida na spec, no LLD ou numa tarefa nova.
- **Um commit só para o plano.** O commit de plano leva o `plano.md` e as mudanças de status
  descritas abaixo, e nada mais.
- **Aprovação antes do commit.** Apresente o plano e espere o usuário aprovar. Só então edite os
  arquivos e faça o commit.
- **Nunca commite na `main`.** Use uma branch `feature/*`, `bugfix/*`, `hotfix/*` ou `docs/*`,
  criada a partir da `main`, conforme o `AGENTS.md` da raiz.
- Se o plano exigir mudança no `docs/hld.md` ou no `docs/lld.md`, pare antes de planejar e use a
  skill `hld` ou `lld` no modo atualizar. O plano aponta para o resultado, não repete a decisão.
- Não invente detalhe de biblioteca, rota ou valor que o LLD e as ADRs não sustentam. Na dúvida,
  consulte o context7 e registre como questão em aberto no plano.

## Estrutura do plano

Escreva em português do Brasil, em
`docs/funcionalidades/<num-funcionalidade>-<titulo>/tarefas/<NN>-<titulo>/plano.md`, com esta
estrutura:

1. **Cabeçalho** — título, `F<NN>-T<NN>`, links para a tarefa e a spec e a data do plano.
2. **Objetivo** — o que a tarefa entrega, em uma ou duas frases.
3. **Escopo** — o que entra e o que fica de fora desta tarefa.
4. **Decisões de implementação** — o que a tarefa decide, apontando para a seção do LLD, da spec ou
   da ADR; o que já está decidido não é reaberto.
5. **Passos** — em ordem, cada passo com os arquivos que toca, o que muda e como verificar que
   ficou certo. Passos pequenos e verificáveis.
6. **Testes** — os testes a criar ou ajustar, pelo tipo (unidade, integração, ponta a ponta), com o
   comportamento que cada um prova.
7. **Verificação** — os comandos de lint, typecheck e teste, executados nos contêineres do Docker
   Compose, e o roteiro manual quando a tarefa tiver interface.
8. **Riscos e rollback** — o que pode dar errado e como desfazer.
9. **Questões em aberto** — checklist `- [ ]`, uma por decisão que o plano não consegue fechar.

## Status e commit de plano

Depois da aprovação do usuário, antes de commitar:

- mude o `Status` do `tarefa.md` para "em andamento";
- se for o primeiro commit de plano de uma tarefa da funcionalidade, mude o status da
  funcionalidade no `docs/roadmap.md` para "em andamento";
- não conclua a funcionalidade nem a tarefa: "concluída" só no PR que entrega.

Faça o commit só com esses arquivos e com o `plano.md`, porque os demais registros da tarefa são
escritos durante a implementação e entram no PR da tarefa. Use uma mensagem curta e descritiva, no
estilo do repositório, como `Planeja a tarefa F01-T02 <título>`.

## Entrega

Ao terminar, resuma: o que o plano cobre, quais arquivos serão tocados, como será verificado, o que
ficou em aberto e o hash do commit de plano.
