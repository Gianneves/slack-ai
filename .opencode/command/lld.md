---
description: Gera ou revisa o LLD (docs/lld.md) a partir do HLD
---

Sua tarefa é gerar ou revisar o LLD (Low-Level Design) do projeto a partir do HLD.

## Fonte

O documento de entrada é indicado em $ARGUMENTS (ex.: "do @docs/hld.md").
Se $ARGUMENTS estiver vazio, use `docs/hld.md`. Leia-o por completo antes
de escrever qualquer linha do LLD. A partir dele, extraia: contêineres e
tecnologias, fluxos principais, dados e regras de consistência, conceitos
transversais, ambientes de implantação, decisões (ADRs) e questões em aberto.

## Contexto existente

Se `docs/lld.md` já existir, leia-o antes de editar:

- Preserve decisões cujos ADRs têm status "aceita" — elas só mudam com um novo ADR
  que as supersede;
- Preserve respostas já resolvidas de questões em aberto;
- Revise apenas as seções afetadas pelo documento de entrada; não reescreva o
  documento do zero;
- Mantenha a tabela "Onde mora cada fato" do início do documento coerente com o
  que ele passa a dizer.

## Estrutura do LLD

Escreva o LLD em português do Brasil, em `docs/lld.md`, com estas doze seções:

1. **Estrutura do código** — árvore do repositório (pastas, com situação de cada
   peça: existe, planejada, a detalhar) e tabela de escolhas por papel
   (frontend, API, bibliotecas, ferramentas), com a coluna "Por quê" apontando
   HLD, ADR ou "A definir".
2. **Componentes e dependências** — tipos de peça de cada aplicação, o que cada
   tipo pode chamar e o diagrama das dependências permitidas; integrações
   externas em tabela (operação, recebe, devolve, garante), com situação.
3. **Conceitos transversais de implementação** — segurança (cookie, CSRF,
   credenciais), concorrência e idempotência, transações, erros (formato e
   catálogo), logs (níveis e regras), configuração (validação, `.env.example`,
   falha na subida).
4. **Dados** — convenções (nomes, id, datas, exclusão), entidades por banco
   apontando a seção do HLD de onde vêm, e a situação de cada uma.
5. **Interfaces** — convenções (prefixo, autenticação por consumidor, formato
   de campos, paginação, erros, eventos do WebSocket) e índice das rotas
   (método e caminho, situação, comportamento).
6. **Estados e regras** — uma subseção por domínio (tarefa, sessão e login,
   mensagem, pedido ao agente...), com as regras decididas e diagramas de
   estado em Mermaid com legenda.
7. **Processos de segundo plano** — tabela de jobs (disparo, o que faz, na
   falha, situação) e rotinas auxiliares.
8. **Cliente** — telas em tabela (rota, acesso, lê, ações, situação), leituras
   e tempo real, sessão no cliente, notificação do navegador, reação a erros.
9. **Valores e configuração** — valores de regra em tabela (nome, valor com
   origem, onde vale, constante ou variável) e variáveis de ambiente por
   projeto (com as já existentes marcadas).
10. **Ambiente de desenvolvimento** — contêineres e substitutos dos serviços de
    produção, diferenças do local que mudam o código ou os testes.
11. **Decisões** — tabela de ADRs (número, título linkado, status).
12. **Questões em aberto** — checklist `- [ ]`, agrupada por tema, cada uma
    apontando para a seção onde impacta.

Onde a implementação já existe no repositório, marque a situação ("existe",
"planejada", "a detalhar") em vez de descrever como se fosse decidido.

## ADRs

Para cada decisão de implementação tomada no LLD (biblioteca, framework,
convenção que os projetos têm de seguir, mecanismo de segurança), crie
`docs/adr/NNNN-titulo-em-minusculas.md`, com numeração sequencial continuando
a do HLD — verifique o maior número que já existe em `docs/adr/`:

```markdown
# ADR NNNN — Título da decisão

## Contexto
Por que a decisão se impõe: o problema, as opções consideradas.

## Decisão
O que foi decidido, de forma afirmativa e concisa.

## Consequências
O que a decisão traz de positivo, de negativo e que penalidades/dívidas cria.
```

Status inicial: "proposta" (aparece na frente do número na tabela da seção 11).
Uma decisão já presente com ADR "aceita" não vira nova ADR — cite o ADR
existente no ponto em que ela vale.

Sempre link os ADRs na tabela da seção 11 e, no corpo, quando a seção depende
de decisão. Se o LLD revisar algo sem decisão fechada, não crie ADR: registre
como questão em aberto. Decisão que muda o desenho de alto nível não é do LLD:
aponte de volta ao HLD (seção 10 dele).

## Regras de qualidade

- Todo item do LLD rastreia ao HLD: na dúvida, diga explicitamente qual seção
  ou fluxo do HLD é a origem. Marque "A definir" o que o HLD não responde — e
  lance como questão em aberto.
- Prefira afirmações claras e curtas a explicações longas; o que você não
  souber, não chute.
- Diagramas Mermaid com legenda; rotule as transições e setas com o que as
  dispara.
- Não invente detalhes que o HLD não sustenta (endpoints, nomes de bibliotecas,
  valores). Onde o HLD diz "a definir", o LLD diz "a definir" e lança questão
  em aberto.

## Entrega

Ao terminar, resuma: o que o LLD tem de novo ou revisado, quais ADRs foram
criados e o que ficou em aberto.
