import { randomUUID } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const CHAT_API_DIR = path.resolve(__dirname, "../../../chat-api");
const NEST_BIN = path.join(CHAT_API_DIR, "node_modules/.bin/nest");
const CLI_ENTRY = "dist/accounts/cli.js";

export const TEST_PREFIX = "e2e-";
export const TEST_DOMAIN = "teste.local";
export const E2E_PASSWORD = "senha-e2e-do-teste";

export interface TestPerson {
  email: string;
  name: string;
  password: string;
}

function uniqueId(): string {
  return randomUUID();
}

export function uniqueEmail(): string {
  return `${TEST_PREFIX}${uniqueId()}@${TEST_DOMAIN}`;
}

export function unregisteredEmail(): string {
  return `${TEST_PREFIX}sem-conta-${uniqueId()}@${TEST_DOMAIN}`;
}

export function testPerson(): TestPerson {
  const id = uniqueId();

  return {
    email: `${TEST_PREFIX}${id}@${TEST_DOMAIN}`,
    name: `Pessoa E2E ${id.slice(0, 8)}`,
    password: E2E_PASSWORD,
  };
}

function runAccountsCli(args: string[], password?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_ENTRY, ...args], {
      cwd: CHAT_API_DIR,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      output += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Comando de contas falhou (código ${code}): ${output.trim()}`,
        ),
      );
    });

    child.stdin.end(password === undefined ? "" : `${password}\n`);
  });
}

export async function ensureAccountsBuild(): Promise<void> {
  await execFileAsync(NEST_BIN, ["build"], {
    cwd: CHAT_API_DIR,
    env: process.env,
  });
}

export async function createPerson(person: TestPerson): Promise<void> {
  await runAccountsCli(
    ["create-person", person.email, person.name],
    person.password,
  );
}

export async function revokeSessions(email: string): Promise<void> {
  await runAccountsCli(["revoke-sessions", email]);
}
