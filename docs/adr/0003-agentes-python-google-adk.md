# ADR 0003 — Serviço de agentes em Python com Google ADK

Status: aceita

## Contexto

Os agentes precisam de ferramentas, sessões de conversa com o modelo e troca de provedor por
configuração (brief, RNF "Modelo de IA"). Opções consideradas: TypeScript no mesmo ecossistema
do chat, um framework Python de agentes, ou código próprio.

## Decisão

O Serviço de agentes (e o Worker) é um projeto Python que usa o Google ADK para rodar os
agentes.

## Consequências

- Positivo: ecossistema de IA maduro em Python; o ADK dá sessões, ferramentas e suporte a
  vários provedores, o que sustenta o modelo trocável por configuração.
- Negativo: segundo runtime no repositório, com contrato próprio (REST) a manter contra a API
  do chat em TypeScript.
- Dívida: o porquê da escolha do ADK (e não de alternativa) ainda não tem motivo registrado —
  questão em aberto no HLD, seção 12.
