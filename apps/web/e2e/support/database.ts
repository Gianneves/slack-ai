import { createHash } from "node:crypto";
import { Pool } from "pg";
import { TEST_DOMAIN, TEST_PREFIX } from "./accounts";

const TEST_EMAIL_PATTERN = `${TEST_PREFIX}%@${TEST_DOMAIN}`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Vence a Sessão do token apresentado sem depender de espera nem de operação
// de produto: nenhuma operação expõe "vencer agora" (plano, "Decisões").
export async function expireSessionByToken(token: string): Promise<void> {
  const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
  const result = await pool.query(
    "UPDATE sessions SET expires_at = now() - interval '1 second' WHERE token_hash = $1",
    [tokenHash],
  );

  if (result.rowCount !== 1) {
    throw new Error(
      `Nenhuma Sessão para o token informado (linhas afetadas: ${result.rowCount}).`,
    );
  }
}

export async function deleteTestDataByEmail(email: string): Promise<void> {
  await deleteSessionsOf(`SELECT id FROM people WHERE email = $1`, [email]);
  await pool.query("DELETE FROM login_attempts WHERE email = $1", [email]);
  await pool.query("DELETE FROM people WHERE email = $1", [email]);
}

export async function deleteTestDataByPrefix(): Promise<void> {
  await deleteSessionsOf(`SELECT id FROM people WHERE email LIKE $1`, [
    TEST_EMAIL_PATTERN,
  ]);
  await pool.query("DELETE FROM login_attempts WHERE email LIKE $1", [
    TEST_EMAIL_PATTERN,
  ]);
  await pool.query("DELETE FROM people WHERE email LIKE $1", [
    TEST_EMAIL_PATTERN,
  ]);
}

async function deleteSessionsOf(
  peopleQuery: string,
  values: string[],
): Promise<void> {
  await pool.query(
    `DELETE FROM sessions WHERE person_id IN (${peopleQuery})`,
    values,
  );
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
