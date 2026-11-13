import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./support/fixtures";
import { homeHeading, sessionCookie, signIn } from "./support/session";

test("Home renderiza a casca autenticada com a Pessoa da Sessão", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  await expect(
    page.getByRole("navigation", { name: "Seções do workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação do workspace" }),
  ).toBeVisible();
  await expect(page.getByText("Full Cycle Chat", { exact: true })).toBeVisible();
  await expect(homeHeading(page)).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Menu de ${person.name}` }),
  ).toBeVisible();
  await expect(page.getByText(person.name, { exact: true })).toBeVisible();
});

test("menu da Pessoa mostra a Pessoa da Sessão e Sair leva a /entrar", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  await page.getByRole("button", { name: `Menu de ${person.name}` }).click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu).toContainText(person.name);
  await expect(menu).toContainText(person.email);

  await page.getByRole("menuitem", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/entrar$/);
  expect(await sessionCookie(page.context())).toBeNull();
});

test("depois de sair, abrir a Home volta a /entrar", async ({
  page,
  person,
}) => {
  await signIn(page, person);
  await page.getByRole("button", { name: `Menu de ${person.name}` }).click();
  await page.getByRole("menuitem", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar$/);

  await page.goto("/");

  await expect(page).toHaveURL(/\/entrar/);
  await expect(
    page.getByRole("heading", { name: "Entrar no Full Cycle Chat" }),
  ).toBeVisible();
});

test("menu da Pessoa e Sair funcionam só pelo teclado", async ({
  page,
  person,
}) => {
  await signIn(page, person);

  await page.getByRole("button", { name: `Menu de ${person.name}` }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/entrar$/);
  expect(await sessionCookie(page.context())).toBeNull();
});

test("Home não tem violações no axe", async ({ page, person }) => {
  await signIn(page, person);

  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();

  expect(results.violations).toEqual([]);
});
