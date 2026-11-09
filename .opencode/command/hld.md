---
description: Gera ou revisa o HLD (docs/hld.md) a partir do product brief
---

Sua tarefa é gerar ou revisar o HLD (High-Level Design) do projeto a partir do
product brief.

## Fonte

O documento de entrada é indicado em $ARGUMENTS (ex.: "do @docs/product-brief.md").
Se $ARGUMENTS estiver vazio, use `docs/product-brief.md`. Leia-o por completo antes
de escrever qualquer linha do HLD. A partir dele, extraia: visão do produto,
público-alvo, escopo do MVP, fora de escopo, requisitos não funcionais, riscos e
questões em aberto.

## Contexto existente

Se `docs/hld.md` já existir, leia-o antes de editar:

- Preserve decisões cujos ADRs têm status "aceita" — elas só mudam com um novo ADR
  que as supersede;
- Preserve respostas já resolvidas de questões em aberto;
- Revise apenas as seções afetadas pelo documento de entrada; não reescreva o
  documento do zero.

## Estrutura do HLD

Escreva o HLD em português do Brasil, em `docs/hld.md`, com estas doze seções:

1. **Contexto e objetivos** — o que o produto é, funcionalidades que mais pesam no
   desenho, objetivos de arquitetura (letras a, b, c...) e não objetivos. Inclua a
   tabela de stakeholders (papel, o que precisa da arquitetura, onde encontra).
2. **Restrições** — tabela (tipo, restrição, origem). A origem aponta para o item
   do documento de entrada.
3. **Requisitos de qualidade** — tabela priorizada (prioridade, atributo,
   critério); num conflito entre requisitos, desempate explícito: a linha de cima
   ganha.
4. **Contexto do sistema** — diagrama de contexto em Mermaid, legenda e tabela de
   sistemas externos (para que, como, quem inicia).
5. **Arquitetura** — visão de contêineres (aplicações, armazenamentos, fila/broker),
   diagrama Mermaid com legenda, tabela de contêineres (responsabilidade,
   tecnologia) e como conversam entre si.
6. **Fluxos principais** — numerados (6.1, 6.2...), um para cada fluxo essencial
   (ex.: login, tempo real e recuperação, pedido a um agente, tarefa em segundo
   plano...); descreva o caminho de ponta a ponta, citando contêineres e seções.
7. **Dados** — o que cada banco/armazenamento guarda; regras de consistência que
   pesam no desenho (transações atômicas, deduplicação, retenção).
8. **Conceitos transversais** — segurança e privacidade, observabilidade (com ID de
   correlação), erros/retries/idempotência, configuração e segredos, idioma/fuso,
   acessibilidade.
9. **Implantação e ambientes** — tabela de ambientes (para que serve, onde roda),
   como a entrega funciona (CI, migrações compatíveis com a versão anterior, health
   check, rollback).
10. **Decisões** — tabela de ADRs (número, título linkado, status).
11. **Riscos e dívida técnica** — tabela (risco, impacto, mitigação ou plano).
12. **Questões em aberto** — checklist `- [ ]`, uma por questão, cada uma apontando
    para a seção onde impacta.

## ADRs

Para cada decisão arquitetural tomada no HLD (escolha de tecnologia, padrão de
comunicação, dono de algo, mecanismo de segurança), crie
`docs/adr/NNNN-titulo-em-minusculas.md`, com numeração sequencial verificando o que
já existe em `docs/adr/`:

```markdown
# ADR NNNN — Título da decisão

## Contexto
Por que a decisão se impõe: o problema, as opções consideradas.

## Decisão
O que foi decidido, de forma afirmativa e concisa.

## Consequências
O que a decisão traz de positivo, de negativo e que penalidades/dívidas cria.
```

Status inicial: "proposta" (aparece na frente do número na tabela da seção 10).
Uma decisão já presente com ADR "aceita" não vira nova ADR.

Sempre link os ADRs na tabela da seção 10 e, nos fluxos e na seção 4, quando a
seção depende de decisão. Se o HLD revisar algo sem decisão fechada, não crie ADR:
registre como questão em aberto.

## Regras de qualidade

- Todo item do HLD rastreia aos requisitos do documento de entrada: na dúvida,
  diga explicitamente qual item/subitem de origem. Marque "A definir" o que o
  documento não responde — e lance como questão em aberto.
- Prefira afirmações claras e curtas a explicações longas; o que você não souber,
  não chute.
- Diagramas Mermaid com legenda: forma arredondada = pessoa, retângulo =
  contêiner/sistema, cilindro = banco/armazenamento de dados; rotule as setas com
  o que trafega e por qual caminho (REST, WebSocket, SQL, gRPC...).
- Não invente detalhes que o documento de entrada não sustenta (endpoints, nomes
  de ferramentas específicas, números).

## Entrega

Ao terminar, resuma: o que o HLD tem de novo ou revisado, quais ADRs foram criados
e o que ficou em aberto.
