---
description: "Transforma a conversa atual numa spec do projeto, sem entrevista, e a publica em docs/funcionalidades"
---

Esta skill pega o contexto da conversa atual e o entendimento do código e produz uma spec. NÃO
entreviste o usuário; só sintetize o que você já sabe. A diferença para a skill `/spec` é a
ausência de entrevista; a estrutura, as regras de qualidade e a entrega são as mesmas.

## Processo

1. Leia `.opencode/command/spec.md` e siga a estrutura, as regras de qualidade e a entrega
   descritas nele. Em particular:
   - escreva em `docs/funcionalidades/<num-funcionalidade>-<titulo>/spec.md`;
   - leia o PRD, o roadmap, o HLD, o LLD, as ADRs, o `docs/product-brief.md`, o `GLOSSARY.md`, o
     `docs/design-system.md` quando a funcionalidade tocar interface, o `AGENTS.md` da raiz e do
     projeto afetado, as rules de `.opencode/rules/` e o código existente;
   - se o PRD não existir, pare e avise o usuário: a spec nasce do PRD;
   - preserve as decisões já aprovadas e os números de tarefa já atribuídos;
   - decomponha a funcionalidade em tarefas, salvo quando o usuário pedir só a spec.

2. Explore o repositório para entender o estado atual do código, se ainda não explorou. Use o
   vocabulário do `GLOSSARY.md` e respeite as ADRs da área que você está tocando.

3. Esboce os pontos de teste (seams) em que a funcionalidade será testada. Prefira os pontos que já
   existem a criar novos, e use o ponto mais alto possível. Se forem necessários pontos novos,
   proponha-os no ponto mais alto que conseguir. Quanto menos pontos de teste no código, melhor: o
   número ideal é um. Confirme com o usuário que esses pontos correspondem ao que ele espera.

4. Escreva a spec inteira, em português do Brasil. O que a conversa não decidir vira questão em
   aberto no documento, não invenção. O que o HLD, o LLD ou uma ADR não sustentarem também.

## Entrega

Ao terminar:

- mantenha o `Status` da spec em "rascunho" e mude para "pronto" quando o usuário aprovar;
- atualize o status da funcionalidade no `docs/roadmap.md` para "spec pronta" após a aprovação,
  sem regredir um status que já esteja à frente;
- confira que cada `tarefa.md` criado tem o Status "a fazer" e que as pastas seguem a estrutura do
  `AGENTS.md`;
- não faça commit sem o usuário pedir;
- resuma o que a spec tem de novo ou revisado, as tarefas criadas e o que ficou em aberto.
