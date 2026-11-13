import { request } from "@playwright/test";
import { ensureAccountsBuild } from "./support/accounts";
import { deleteTestDataByPrefix } from "./support/database";

const API_URL = "http://chat-api:3000";
const WEB_URL = "http://web:3000";
const HEALTH_TIMEOUT_MS = 180_000;
const HEALTH_REQUEST_TIMEOUT_MS = 60_000;
const HEALTH_INTERVAL_MS = 2_000;

async function waitForStatus(
  url: string,
  expectedStatus: number,
  label: string,
): Promise<void> {
  const context = await request.newContext();
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;

  try {
    while (Date.now() < deadline) {
      try {
        const response = await context.get(url, {
          timeout: HEALTH_REQUEST_TIMEOUT_MS,
          failOnStatusCode: false,
        });

        if (response.status() === expectedStatus) {
          return;
        }
      } catch {
        // Ainda no ar? A próxima rodada tenta de novo até o prazo.
      }

      await new Promise((resolve) => setTimeout(resolve, HEALTH_INTERVAL_MS));
    }
  } finally {
    await context.dispose();
  }

  throw new Error(
    `${label} não respondeu ${expectedStatus} em ${url} depois de ${HEALTH_TIMEOUT_MS / 1000}s. ` +
      "Suba a web e a API antes de rodar a suíte (apps/web/AGENTS.md).",
  );
}

export default async function globalSetup(): Promise<void> {
  await ensureAccountsBuild();
  await waitForStatus(
    `${API_URL}/v1/sessions/current`,
    401,
    "A API do chat",
  );
  await waitForStatus(`${WEB_URL}/entrar`, 200, "A web");
  await deleteTestDataByPrefix();
}
