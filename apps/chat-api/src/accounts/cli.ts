// Entrada do comando de contas. Roda sem o Nest, sobre o mesmo DataSource
// das migrações; a senha vem da entrada padrão e nunca dos argumentos
// (spec da F01, seção 5).
import 'dotenv/config';
import { stderr } from 'node:process';
import dataSource from '../database/data-source.js';
import { normalizeEmail } from '../common/email.js';
import { PeopleRepository } from '../people/people.repository.js';
import { SessionsRepository } from '../sessions/sessions.repository.js';
import { AccountsService } from './accounts.service.js';
import { readPassword } from './password-input.js';

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const EXIT_USAGE = 2;

const USAGE = `Uso: pnpm accounts <operação> [argumentos]

Operações:
  create-person <email> <nome>       Cria a Pessoa; a senha vem da entrada padrão
  revoke-sessions <email>            Apaga todas as Sessões da Pessoa
  reset-password <email>             Troca a senha e apaga todas as Sessões
  purge-expired-sessions             Apaga as Sessões vencidas
`;

interface Operation {
  name:
    | 'create-person'
    | 'revoke-sessions'
    | 'reset-password'
    | 'purge-expired-sessions';
  email?: string;
  nameOfPerson?: string;
}

function parseArguments(argv: string[]): Operation | { error: string } {
  const [operation, ...rest] = argv;

  if (operation === 'create-person') {
    const [email, name] = rest;
    if (email === undefined || name === undefined || rest.length !== 2) {
      return { error: 'create-person exige e-mail e nome.' };
    }
    return { name: operation, email, nameOfPerson: name };
  }

  if (operation === 'revoke-sessions' || operation === 'reset-password') {
    const [email] = rest;
    if (email === undefined || rest.length !== 1) {
      return { error: `${operation} exige um e-mail.` };
    }
    return { name: operation, email };
  }

  if (operation === 'purge-expired-sessions') {
    if (rest.length !== 0) {
      return { error: 'purge-expired-sessions não recebe argumentos.' };
    }
    return { name: operation };
  }

  if (operation === undefined) {
    return { error: 'Informe uma operação.' };
  }

  return { error: `Operação desconhecida: ${operation}.` };
}

async function runOperation(
  accounts: AccountsService,
  operation: Operation,
  password: string,
): Promise<number> {
  if (operation.name === 'purge-expired-sessions') {
    await accounts.purgeExpiredSessions();
    console.log('Sessões vencidas apagadas.');
    return EXIT_SUCCESS;
  }

  const email = operation.email ?? '';

  if (operation.name === 'create-person') {
    const result = await accounts.createPerson({
      email,
      name: operation.nameOfPerson ?? '',
      password,
    });

    if ('error' in result) {
      stderr.write(
        `Já existe uma Pessoa com o e-mail ${normalizeEmail(email)}.\n`,
      );
      return EXIT_FAILURE;
    }

    console.log(`Pessoa criada: ${result.email}`);
    return EXIT_SUCCESS;
  }

  if (operation.name === 'revoke-sessions') {
    const result = await accounts.revokeSessions({ email });
    if ('error' in result) {
      stderr.write(`Pessoa não encontrada: ${normalizeEmail(email)}.\n`);
      return EXIT_FAILURE;
    }

    console.log(`Sessões revogadas: ${normalizeEmail(email)}`);
    return EXIT_SUCCESS;
  }

  const result = await accounts.resetPassword({ email, password });
  if ('error' in result) {
    stderr.write(`Pessoa não encontrada: ${normalizeEmail(email)}.\n`);
    return EXIT_FAILURE;
  }

  console.log(`Senha redefinida e Sessões revogadas: ${normalizeEmail(email)}`);
  return EXIT_SUCCESS;
}

async function main(argv: string[]): Promise<number> {
  const parsed = parseArguments(argv);
  if ('error' in parsed) {
    stderr.write(`${parsed.error}\n\n${USAGE}`);
    return EXIT_USAGE;
  }

  if (!process.env['DATABASE_URL']) {
    stderr.write('DATABASE_URL não definido.\n');
    return EXIT_USAGE;
  }

  let password = '';
  if (parsed.name === 'create-person' || parsed.name === 'reset-password') {
    password = await readPassword(
      parsed.name === 'reset-password' ? 'Nova senha: ' : 'Senha: ',
    );
    if (password.length === 0) {
      stderr.write('A senha não pode ser vazia.\n');
      return EXIT_USAGE;
    }
  }

  try {
    await dataSource.initialize();
    const accounts = new AccountsService(
      new PeopleRepository(dataSource),
      new SessionsRepository(dataSource),
    );
    return await runOperation(accounts, parsed, password);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`Falha ao executar ${parsed.name}: ${message}\n`);
    return EXIT_FAILURE;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`Falha ao executar o comando: ${message}\n`);
    process.exitCode = EXIT_FAILURE;
  });
