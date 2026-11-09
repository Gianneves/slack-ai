#!/bin/bash
# Executado só no primeiro arranque, com o volume vazio (docker-entrypoint-initdb.d).
# Cria os bancos do ambiente local (LLD, seção 10): chat, agents, business e chat_test,
# cada um com um usuário dono de mesmo nome (senha igual ao nome, só local), e o
# usuário business_readonly, que só conecta no business e só lê (ADR 0013).
set -euo pipefail

psql -v ON_ERROR_STOP=1 --dbname postgres <<'SQL'
CREATE ROLE chat LOGIN PASSWORD 'chat';
CREATE ROLE agents LOGIN PASSWORD 'agents';
CREATE ROLE business LOGIN PASSWORD 'business';
CREATE ROLE business_readonly LOGIN PASSWORD 'business_readonly';

CREATE DATABASE chat OWNER chat;
CREATE DATABASE agents OWNER agents;
CREATE DATABASE business OWNER business;
CREATE DATABASE chat_test OWNER chat;

REVOKE CONNECT ON DATABASE chat FROM PUBLIC;
REVOKE CONNECT ON DATABASE agents FROM PUBLIC;
REVOKE CONNECT ON DATABASE business FROM PUBLIC;
REVOKE CONNECT ON DATABASE chat_test FROM PUBLIC;
SQL

psql -v ON_ERROR_STOP=1 --dbname business <<'SQL'
GRANT CONNECT ON DATABASE business TO business_readonly;
ALTER SCHEMA public OWNER TO business;
GRANT USAGE ON SCHEMA public TO business_readonly;
-- Vale para as tabelas que o script de carga criar como business.
ALTER DEFAULT PRIVILEGES FOR ROLE business IN SCHEMA public GRANT SELECT ON TABLES TO business_readonly;
SQL
