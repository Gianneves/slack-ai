# ADR 0014 — Lastro de cada número conferido antes de gravar

Status: aceita

## Contexto

A meta é entregar 0 número sem lastro (brief, "Objetivos e métricas" e RNF "Confiabilidade").
Mesmo com o resultado da consulta em mãos, o modelo pode alucinar um número ao redigir a
resposta ou o relatório.

## Decisão

Antes de gravar uma resposta ou um relatório com dados de negócio, o agente confere que cada
número do texto aparece no resultado da consulta que o produziu. Sem lastro, o texto é barrado
e não chega à conversa.

## Consequências

- Positivo: todo número entregue é rastreável até a consulta (objetivo f do HLD, seção 1);
  respostas barradas viram log e insumo para a avaliação do agente.
- Negativo: respostas corretas podem ser barradas por comparação estrita (falso positivo);
  pela prioridade da seção 3 do HLD, correção vem antes de conveniência.
- Dívida: a forma exata da comparação do lastro está a definir (LLD, seção 12).
