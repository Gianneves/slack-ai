import { revokeSessions } from "./support/accounts";
import { expireSessionByToken } from "./support/database";
import { expect, test } from "./support/fixtures";
import {
  fillAndSubmitLogin,
  homeTitle,
  readSessionToken,
  saveStorageState,
  sessionCookie,
  signIn,
} from "./support/session";

const ONE_DAY_SECONDS = 24 * 60 * 60;
const COOKIE_MAX_AGE_SECONDS = 400 * ONE_DAY_SECONDS;

test("entrar grava o cookie de Sessão com os atributos do LLD e leva à Home", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  const cookie = await sessionCookie(page.context());
  expect(cookie).not.toBeNull();
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.secure).toBe(false);
  expect(cookie?.sameSite).toBe("Lax");
  expect(cookie?.path).toBe("/");
  const expiresInSeconds = (cookie?.expires ?? 0) - Date.now() / 1000;
  expect(expiresInSeconds).toBeGreaterThan(
    COOKIE_MAX_AGE_SECONDS - ONE_DAY_SECONDS,
  );
});

test("sair apaga o cookie, leva a /entrar e mantém a outra Sessão", async ({
  page,
  person,
  browser,
  baseURL,
}) => {
  await signIn(page, person);

  const otherContext = await browser.newContext({ baseURL });
  const otherPage = await otherContext.newPage();
  await signIn(otherPage, person);

  try {
    await page
      .getByRole("button", { name: `Menu de ${person.name}` })
      .click();
    await page.getByRole("menuitem", { name: "Sair" }).click();

    await expect(page).toHaveURL(/\/entrar$/);
    expect(await sessionCookie(page.context())).toBeNull();

    await otherPage.goto("/");
    await expect(homeTitle(otherPage)).toBeVisible();
  } finally {
    await otherContext.close();
  }
});

test("leva à Home quando o para é inválido ou começa com //", async ({
  person,
  browser,
  baseURL,
}) => {
  for (const para of ["//outro", "https://example.com/outro"]) {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
      await page.goto(`/entrar?para=${encodeURIComponent(para)}`);
      await fillAndSubmitLogin(page, person);
      await expect(homeTitle(page)).toBeVisible();
      expect(new URL(page.url()).pathname).toBe("/");
    } finally {
      await context.close();
    }
  }
});

test("redireciona a área logada sem cookie para /entrar com o para", async ({
  page,
}) => {
  await page.goto("/?de=canal");

  await expect(page).toHaveURL(/\/entrar\?para=/);
  expect(new URL(page.url()).searchParams.get("para")).toBe("/?de=canal");
  await expect(
    page.getByRole("heading", { name: "Entrar no Full Cycle Chat" }),
  ).toBeVisible();
});

test("Sessão válida renderiza a Home com a Pessoa da verificação", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  await expect(homeTitle(page)).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Menu de ${person.name}` }),
  ).toBeVisible();
  await expect(page.getByText(person.name, { exact: true })).toBeVisible();
});

test("Sessão revogada apaga o cookie e leva a /entrar com o para", async ({
  page,
  person,
}) => {
  await signIn(page, person);
  await revokeSessions(person.email);

  await page.goto("/?de=canal");

  await expect(page).toHaveURL(/\/entrar\?para=/);
  expect(new URL(page.url()).searchParams.get("para")).toBe("/?de=canal");
  expect(await sessionCookie(page.context())).toBeNull();
});

test("Sessão vencida apaga o cookie e leva a /entrar com o para", async ({
  page,
  person,
}) => {
  await signIn(page, person);
  await expireSessionByToken(await readSessionToken(page));

  await page.goto("/?de=canal");

  await expect(page).toHaveURL(/\/entrar\?para=/);
  expect(new URL(page.url()).searchParams.get("para")).toBe("/?de=canal");
  expect(await sessionCookie(page.context())).toBeNull();
});

test("recarregar, abrir outra aba e reabrir em contexto novo mantêm a Sessão", async ({
  page,
  person,
  browser,
  baseURL,
}) => {
  await signIn(page, person);

  await page.reload();
  await expect(homeTitle(page)).toBeVisible();

  const anotherTab = await page.context().newPage();
  await anotherTab.goto("/");
  await expect(homeTitle(anotherTab)).toBeVisible();
  await anotherTab.close();

  const storageState = await saveStorageState(page.context());
  const reopened = await browser.newContext({ baseURL, storageState });
  const reopenedPage = await reopened.newPage();

  try {
    await reopenedPage.goto("/");
    await expect(homeTitle(reopenedPage)).toBeVisible();
  } finally {
    await reopened.close();
  }
});
