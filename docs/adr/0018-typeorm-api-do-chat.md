# ADR 0018 — TypeORM na API do chat

Status: aceita

## Contexto

A API do chat (NestJS) lê e escreve no Banco do chat (Postgres gerenciado) e precisa de
migrações que rodam antes da nova versão subir e são sempre compatíveis com a versão anterior
(HLD, seção 9, "Entrega"). Opções consideradas: TypeORM, Prisma, Knex ou SQL cru.

## Decisão

TypeORM, com uma estratégia de nomes que converte os nomes do código em `snake_case`, e as
migrações em `apps/chat-api/migrations`.

## Consequências

- Positivo: integração nativa com o Nest (`@nestjs/typeorm`) e decorators que o
  `@nestjs/swagger` lê no mesmo código; migrações versionadas no repositório, rodaáveis antes de
  cada implantação.
- Negativo: convenções e repositórios próprios do TypeORM, menos difundidos que alternativas
  mais recentes; a estratégia de nomes é peça extra de configurar.
