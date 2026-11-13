import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { revokeSessions, unregisteredEmail } from "./support/accounts";
import { deleteTestDataByEmail } from "./support/database";
import { expect, test } from "./support/fixtures";
import {
  fillAndSubmitLogin,
  homeTitle,
  sessionCookie,
  signIn,
} from "./support/session";

const INVALID_CREDENTIALS_MESSAGE =
  "E-mail ou senha incorretos. Verifique e tente de novo.";
const BLOCKED_MESSAGE =
  /^Muitas tentativas\. Tente de novo em \d+ (segundos?|minutos?)\.$/;
const WRONG_PASSWORD = "senha-errada";

function invalidCredentialsAlert(page: Page) {
  return page
    .getByRole("alert")
    .filter({ hasText: INVALID_CREDENTIALS_MESSAGE });
}

function blockedAlert(page: Page) {
  return page.getByRole("alert").filter({ hasText: "Muitas tentativas" });
}

// Submete credenciais que falham e espera a resposta: o form volta vazio
// depois da action, então o campo vazio é o sinal de que ela terminou. Sem
// isso, uma nova submissão pode ser preenchida e apagada pelo reset da
// anterior.
async function submitCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByLabel("E-mail")).toHaveValue("");
}

test("entra com credencial válida e chega à Home", async ({ page, person }) => {
  await page.goto("/entrar");

  await fillAndSubmitLogin(page, person);

  await expect(page).toHaveURL(/\/$/);
  await expect(homeTitle(page)).toBeVisible();
  expect(await sessionCookie(page.context())).not.toBeNull();
});

test("entra e volta ao caminho do para válido", async ({ page, person }) => {
  await page.goto("/?de=canal");
  await expect(page).toHaveURL(/\/entrar\?para=/);

  await fillAndSubmitLogin(page, person);

  await expect(page).toHaveURL(/\/\?de=canal$/);
  await expect(homeTitle(page)).toBeVisible();
});

test("credencial errada e e-mail sem conta mostram a mesma mensagem e permitem tentar de novo", async ({
  page,
  person,
}) => {
  const missingAccount = unregisteredEmail();

  await page.goto("/entrar");

  await submitCredentials(page, person.email, WRONG_PASSWORD);
  await expect(invalidCredentialsAlert(page)).toHaveText(
    INVALID_CREDENTIALS_MESSAGE,
  );

  await submitCredentials(page, missingAccount, WRONG_PASSWORD);
  await expect(invalidCredentialsAlert(page)).toHaveText(
    INVALID_CREDENTIALS_MESSAGE,
  );

  await fillAndSubmitLogin(page, person);
  await expect(homeTitle(page)).toBeVisible();

  await deleteTestDataByEmail(missingAccount);
});

test("bloqueio mostra o tempo que falta e não grava a Sessão", async ({
  page,
  person,
}) => {
  await page.goto("/entrar");

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await submitCredentials(page, person.email, WRONG_PASSWORD);
    await expect(invalidCredentialsAlert(page)).toHaveText(
      INVALID_CREDENTIALS_MESSAGE,
    );
  }

  await submitCredentials(page, person.email, WRONG_PASSWORD);
  await expect(blockedAlert(page)).toHaveText(BLOCKED_MESSAGE);

  await fillAndSubmitLogin(page, person);
  await expect(page.getByLabel("E-mail")).toHaveValue("");
  await expect(blockedAlert(page)).toHaveText(BLOCKED_MESSAGE);
  expect(await sessionCookie(page.context())).toBeNull();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("abrir /entrar com Sessão válida vai para a Home", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  await page.goto("/entrar");

  await expect(page).toHaveURL(/\/$/);
  await expect(homeTitle(page)).toBeVisible();
});

test("formulário funciona por teclado e anuncia o erro", async ({
  page,
  person,
}) => {
  await page.goto("/entrar");

  await page.getByLabel("E-mail").focus();
  await page.keyboard.type(person.email);
  await page.keyboard.press("Tab");
  await page.keyboard.type(WRONG_PASSWORD);
  await page.keyboard.press("Enter");

  const alert = invalidCredentialsAlert(page);
  await expect(alert).toHaveText(INVALID_CREDENTIALS_MESSAGE);
  await expect(alert).toHaveAttribute("id", "login-error");
  await expect(page.getByLabel("E-mail")).toHaveAttribute(
    "aria-describedby",
    "login-error",
  );
  await expect(page.getByLabel("E-mail")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await page.getByLabel("E-mail").fill(person.email);
  await page.getByLabel("Senha").fill(person.password);
  await page.keyboard.press("Enter");

  await expect(homeTitle(page)).toBeVisible();
});

test("Sessão recusada em /entrar apaga o cookie e mostra o formulário", async ({
  page,
  person,
}) => {
  await signIn(page, person);
  await revokeSessions(person.email);

  await page.goto("/entrar");

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(
    page.getByRole("heading", { name: "Entrar no Full Cycle Chat" }),
  ).toBeVisible();
  expect(await sessionCookie(page.context())).toBeNull();
});

test("login não tem violações no axe", async ({ page }) => {
  await page.goto("/entrar");

  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();

  expect(results.violations).toEqual([]);
});
