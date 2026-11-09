# ADR 0023 — Limite de tentativas de login contado só pelo e-mail

Status: aceita

## Contexto

O login tem limite de tentativas (HLD 6.1), e é preciso escolher a chave da contagem. Opções
consideradas: por IP, por IP e e-mail, ou só pelo e-mail. A origem do IP atrás do proxy da PaaS
é incerta, e contar por IP pune quem divide a rede.

## Decisão

A contagem é só pelo e-mail normalizado, inclusive de e-mails sem conta, guardada no Banco do
chat, com incremento atômico no próprio `UPDATE` do upsert. As regras de estado (janela,
bloqueio, `Retry-After`) estão no LLD, seção 6.2.

## Consequências

- Positivo: a regra não depende de cabeçalho de IP atrás de proxy; a resposta é a mesma para
  e-mail com e sem conta, e o estado de um e-mail é uma linha só, fácil de auditar.
- Negativo: um terceiro pode bloquear o e-mail de outra pessoa à mão — janela e bloqueio curtos
  (15 min) limitam o dano; quem esquece a senha durante o bloqueio espera ele passar.
