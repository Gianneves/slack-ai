import { expect, type BrowserContext, type Page } from "@playwright/test";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "session";

export const HOME_TITLE = "Bem-vindo ao Full Cycle Chat";

export function homeTitle(page: Page) {
  return page.getByRole("heading", { name: HOME_TITLE });
}

export interface SessionPerson {
  email: string;
  password: string;
}

export async function fillAndSubmitLogin(
  page: Page,
  person: SessionPerson,
): Promise<void> {
  await page.getByLabel("E-mail").fill(person.email);
  await page.getByLabel("Senha").fill(person.password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export async function signIn(
  page: Page,
  person: SessionPerson,
): Promise<void> {
  await page.goto("/entrar");
  await fillAndSubmitLogin(page, person);
  await expect(homeTitle(page)).toBeVisible();
}

export async function sessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();

  return (
    cookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME) ?? null
  );
}

export async function readSessionToken(page: Page): Promise<string> {
  const cookie = await sessionCookie(page.context());

  if (cookie === null) {
    throw new Error("O contexto não tem cookie de Sessão.");
  }

  return cookie.value;
}

export async function saveStorageState(context: BrowserContext) {
  return context.storageState();
}
