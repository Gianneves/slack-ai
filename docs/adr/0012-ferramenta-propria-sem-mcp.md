# ADR 0012 — Ferramenta própria em Python em vez de MCP

Status: aceita

## Contexto

O MCP padronizou como ligar um agente a um banco de dados (brief, "Problema e contexto"), mas
as ferramentas de MCP são genéricas: quem define a consulta é o modelo. O RNF "Dados de
negócio" exige somente leitura imposto pelo banco e consultas que possam ser auditadas e
conferidas antes de rodar.

## Decisão

A consulta ao Banco de negócio é uma ferramenta própria em Python, dentro do projeto de
agentes. O agente não usa MCP para falar com o banco de negócio.

## Consequências

- Positivo: toda consulta passa pela conferência de somente leitura no código e pela auditoria
  antes de rodar (ADRs 0013 e fluxo 6.4 do HLD); superfície de ataque menor.
- Negativo: abre mão do ecossistema de servidores MCP; a ferramenta é mantida pelo próprio
  projeto.
