# ADR 0001 — Monorepo com três aplicações

Status: aceita

## Contexto

O produto tem uma interface web, um chat com tempo real e agentes de IA que precisam de um
ecossistema próprio (Python). Opções consideradas: um serviço só com tudo dentro, um monorepo
com aplicações implantadas separadamente, ou um repositório por aplicação. O chat não pode
depender dos agentes (objetivo a do HLD, seção 1), e a pilha inteira roda em um servidor
pequeno (brief, RNF "Hospedagem").

## Decisão

Um repositório único (monorepo) com três aplicações implantadas separadamente: Frontend/BFF
(Next.js), API do chat (NestJS) e agentes (Python + Google ADK), além de pacotes compartilhados
na raiz.

## Consequências

- Positivo: um clone traz todo o produto; mudanças transversais (tipos de eventos, contrato)
  ficam em um commit; a implantação separada mantém a independência em execução.
- Negativo: repositório maior, com runtimes diferentes convivendo; a CI precisa reconhecer o
  que mudou para não reconstruir tudo.
- Dívida: convenção de pastas e filtragem de pipeline por caminho, mantidas pelo LLD
  (seção 1).
