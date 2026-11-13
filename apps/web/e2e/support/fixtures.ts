import { test as base } from "@playwright/test";
import {
  createPerson,
  testPerson,
  type TestPerson,
} from "./accounts";
import { deleteTestDataByEmail } from "./database";

export const test = base.extend<{ person: TestPerson }>({
  person: async ({}, provide) => {
    const person = testPerson();
    await createPerson(person);
    await provide(person);
    await deleteTestDataByEmail(person.email);
  },
});

export { expect } from "@playwright/test";
