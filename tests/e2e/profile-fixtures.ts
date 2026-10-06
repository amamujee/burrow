import type { Page } from "@playwright/test";
import { profilesDatabaseName } from "../../src/lib/profile-persistence";
import { profilesKey, type ProfilesState } from "../../src/lib/profile-save";

export async function readTransactionalProfileFixture(page: Page): Promise<ProfilesState> {
  return page.evaluate(({ name, key }) => new Promise<ProfilesState>((resolve, reject) => {
    const open = indexedDB.open(name, 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const database = open.result;
      const transaction = database.transaction("profiles", "readonly");
      const request = transaction.objectStore("profiles").get(key);
      transaction.oncomplete = () => { database.close(); resolve(request.result); };
      transaction.onabort = () => { database.close(); reject(transaction.error); };
    };
  }), { name: profilesDatabaseName, key: profilesKey });
}

// Fixture writes to localStorage represent saves from releases before IndexedDB.
// Remove the transactional copy so the next load exercises that migration.
export async function useLegacyProfileFixture(page: Page) {
  await page.evaluate((name) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }), profilesDatabaseName);
}
