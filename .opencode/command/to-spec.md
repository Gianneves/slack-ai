---
description: "Cria ou revisa a spec de uma funcionalidade, entrevistando o usuário, e a decompõe em tarefas"
---

Sua tarefa é criar ou revisar a spec (especificação técnica) de uma funcionalidade do Full Cycle
Chat e decompor a funcionalidade em tarefas. Esta skill não implementa código nem cria plano de
tarefa.

## Fonte

A funcionalidade é indicada em $ARGUMENTS, pelo número (`F01`), pelo título ou pela pasta
(`docs/funcionalidades/01-entrar-e-sair`). Se $ARGUMENTS estiver vazio, leia
`docs/roadmap.md` e pergunte qual funcionalidade será especificada.

Antes de escrever, leia:

- `docs/funcionalidades/<num-funcionalidade>-<titulo>/prd.md`, que é a fonte dos requisitos de
  produto desta funcionalidade;
- `docs/roadmap.md`, que é o dono da lista de funcionalidades, da ordem, das dependências e do
  status;
- `docs/hld.md`, `docs/lld.md` e as ADRs em `docs/adr/`, que são a fonte das decisões de
  arquitetura e de implementação;
- `docs/product-brief.md` e `GLOSSARY.md`, para escopo, público e vocabulário;
- `docs/design-system.md`, se a funcionalidade tocar interface;
- o `AGENTS.md` da raiz e o `AGENTS.md` do projeto afetado, para comandos e práticas;
- as rules de `.opencode/rules/` que valem para os arquivos que a funcionalidade vai tocar;
- o código existente dos projetos afetados, para marcar o que já existe, o que está planejado e o
  que está a detalhar.

Se o PRD não existir, pare e avise o usuário: a spec nasce do PRD.

## Contexto existente

Se `spec.md` já existir, leia-o antes de editar:

- preserve as decisões já aprovadas pelo usuário e os números de tarefa já atribuídos;
- revise apenas as seções afetadas pelo pedido, sem reescrever o documento do zero;
- uma tarefa com plano commitado não muda: uma decisão errada é corrigida na spec, no LLD ou numa
  tarefa nova.

## Processo

1. Explore o repositório para entender o estado atual do código, se ainda não explorou. Use o
   vocabulário do `GLOSSARY.md` e respeite as ADRs da área que você está tocando.

2. Esboce os pontos de teste (seams) em que a funcionalidade será testada. Prefira os pontos que já
   existem a criar novos, e use o ponto mais alto possível. Se forem necessários pontos novos,
   proponha-os no ponto mais alto que conseguir. Quanto menos pontos de teste no código, melhor: o
   número ideal é um.

3. Entreviste o usuário e confirme com ele os pontos de teste. Use primeiro o que a conversa atual
   e os documentos já respondem: não pergunte o que já está decidido. Pergunte o que falta para
   fechar as decisões de implementação e de teste, uma pergunta por vez, com opções quando ajudar a
   decidir.

4. Escreva a spec inteira, em português do Brasil. O que a conversa não decidir vira questão em
   aberto no documento, não invenção. O que o HLD, o LLD ou uma ADR não sustentarem também.

## Estrutura da spec

Escreva em português do Brasil, em `docs/funcionalidades/<num-funcionalidade>-<titulo>/spec.md`,
com esta estrutura:

1. **Cabeçalho** — título, `Status: rascunho`, o número da funcionalidade e links para o PRD, o
   roadmap, o HLD e o LLD.
2. **Objetivo técnico** — o que será construído, em poucas frases, apontando para o PRD em vez de
   repetir os requisitos.
3. **Decisões de implementação** — o que esta funcionalidade decide e como cada decisão se apoia
   no LLD, em uma ADR ou em uma seção do HLD. O que já está decidido no LLD não é reaberto aqui.
   Se a funcionalidade precisar mudar o HLD ou o LLD, pare e use a skill `hld` ou `lld` no modo
   atualizar antes de continuar.
4. **Componentes afetados** — por projeto (`chat-api`, `web`, `agents`, `packages`), os módulos,
   serviços, rotas, telas e eventos que entram ou mudam, com a situação de cada um ("existe",
   "planejada", "a detalhar").
5. **Dados** — entidades, tabelas, colunas, índices e migrações, apontando para a seção 4 do LLD;
   só o que é delta desta funcionalidade.
6. **Interfaces** — rotas REST, eventos do WebSocket, Server Actions e integrações, apontando para
   a seção 5 do LLD e para o snapshot OpenAPI; só o que é delta desta funcionalidade.
7. **Estados e regras** — as regras de negócio e as máquinas de estado específicas, apontando para
   a seção 6 do LLD, com diagrama Mermaid quando houver transição.
8. **Decomposição em tarefas** — as tarefas da funcionalidade, numeradas a partir de `01` na ordem
   de dependência, cada uma com título, resultado entregável e dependências. Para cada tarefa,
   crie `tarefas/<NN>-<titulo>/tarefa.md` com Status "a fazer", objetivo, escopo, critérios de
   aceite e dependências.
9. **Estratégia de teste** — o que será provado em teste de unidade, de integração e de ponta a
   ponta, seguindo as rules de teste do projeto afetado, e o que exige roteiro manual.
10. **Riscos e questões em aberto** — o que pode dar errado e o checklist `- [ ]` das decisões que
    faltam, cada uma indicando o que trava.

## Regras de qualidade

- A spec diz como construir, não o que a pessoa sente: requisito de produto fica no PRD.
- Todo item rastreia ao PRD, ao HLD, ao LLD ou a uma ADR. Na dúvida, diga qual seção é a origem.
  O que nenhum documento responde vira questão em aberto, não invenção.
- Não repita no corpo o que o LLD já registra: aponte para a seção. Duas cópias divergem.
- Use os termos do `GLOSSARY.md`. Se o PRD usar um termo que conflita com o glossário, aponte o
  conflito antes de escrever.
- Não invente rota, nome de biblioteca, coluna ou valor que o LLD e as ADRs não sustentam. Para
  biblioteca, consulte o context7.
- Não coloque rótulos de triagem (prioridade, P0, tamanho, estimativa).
- Tarefas usam número de dois dígitos e título em kebab-case sem acento
  (`01-login-no-bff`). O número da tarefa não muda depois de atribuído.

## Entrega

Ao terminar:

- mantenha o `Status` do `spec.md` em "rascunho" e mude para "pronto" quando o usuário aprovar;
- atualize o status da funcionalidade no `docs/roadmap.md` para "spec pronta" após a aprovação,
  sem regredir um status que já esteja à frente;
- decomponha a funcionalidade em tarefas, salvo quando o usuário pedir só a spec;
- confira que cada `tarefa.md` criado tem o Status "a fazer" e que as pastas seguem a estrutura do
  `AGENTS.md`;
- não faça commit sem o usuário pedir;
- resuma o que a spec tem de novo ou revisado, as tarefas criadas e o que ficou em aberto.
