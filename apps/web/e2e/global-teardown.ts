import { closeDatabase, deleteTestDataByPrefix } from "./support/database";

export default async function globalTeardown(): Promise<void> {
  await deleteTestDataByPrefix();
  await closeDatabase();
}
