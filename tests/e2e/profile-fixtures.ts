import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { profilesBackupKey, profilesDatabaseName } from "../../src/lib/profile-persistence";
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

// Seed once in the next document, after the old app has stopped writing. The
// database deletion is queued before the new app opens it, exercising migration.
export async function useLegacyProfileFixture(page: Page, contents: string, backup: string | null = null) {
  await page.addInitScript(({ name, key, backupKey, contents, backup, marker }) => {
    if (sessionStorage.getItem(marker)) return;
    sessionStorage.setItem(marker, "true");
    localStorage.setItem(key, contents);
    if (backup === null) localStorage.removeItem(backupKey);
    else localStorage.setItem(backupKey, backup);
    indexedDB.deleteDatabase(name);
  }, { name: profilesDatabaseName, key: profilesKey, backupKey: profilesBackupKey, contents, backup, marker: `burrow-fixture-${randomUUID()}` });
}
