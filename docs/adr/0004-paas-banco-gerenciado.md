# ADR 0004 — Plataforma gerenciada (PaaS) com banco gerenciado

Status: aceita

## Contexto

A pilha inteira roda em um único servidor de 2 GB de RAM, com HTTPS e implantação automática
que volta à versão anterior se algo falhar (brief, RNF "Hospedagem"). Não há time de operação
dedicado. Opções consideradas: servidor próprio administrado à mão, contêineres em nuvem
genérica, ou uma PaaS.

## Decisão

Rodar em uma PaaS gerenciada, com Postgres, Redis e armazenamento de objetos gerenciados por
ela. A PaaS precisa oferecer: contêineres para Next.js, NestJS com WebSocket e Python; Postgres
gerenciado; Redis gerenciado; rede privada; armazenamento compatível com S3; volta automática de
versão (HLD, seção 9).

## Consequências

- Positivo: sem administrar servidor nem banco; HTTPS, rede privada e rollback de versão vêm de
  fábrica, o que cobre a ausência de alta disponibilidade.
- Negativo: custo recorrente de várias peças pagas (quatro contêineres, Postgres, Redis,
  armazenamento), sem orçamento definido — risco registrado no HLD, seção 11.
- Dívida: qual PaaS atende às exigências está em aberto (HLD, seção 12).
