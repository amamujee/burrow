import { profilesKey, type ProfilesState } from "./profile-save";

export const profilesDatabaseName = "burrow-profile-store";
export const profilesBackupKey = `${profilesKey}-backup`;
const storeName = "profiles";

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(profilesDatabaseName, 1);
  let blocked = false;
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  request.onblocked = () => { blocked = true; reject(new Error("Close older Burrow tabs and retry saving")); };
  request.onerror = () => reject(request.error);
  request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
});

export async function readProfileDatabase(): Promise<ProfilesState | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(profilesKey);
    transaction.oncomplete = () => { database.close(); resolve(request.result); };
    transaction.onabort = () => { database.close(); reject(transaction.error); };
  });
}

// localStorage is retained for migration and a readable recovery copy. Its
// per-tab caches are not coherent enough for read/modify/write, even under Web
// Locks. An IndexedDB transaction owns the authoritative shared snapshot.
export async function updateProfileDatabase(update: (stored: ProfilesState | undefined) => ProfilesState): Promise<ProfilesState> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.get(profilesKey);
    let next: ProfilesState;
    let previous: string | null | undefined;
    let contents: string | undefined;
    let failure: unknown;
    request.onsuccess = () => {
      try {
        next = update(request.result);
        previous = localStorage.getItem(profilesKey);
        contents = JSON.stringify(next);
        const backup = request.result && JSON.stringify(request.result);
        if (backup && backup !== contents) {
          try { localStorage.setItem(profilesBackupKey, backup); } catch { /* The primary writes report failure. */ }
        }
        localStorage.setItem(profilesKey, contents);
        store.put(next, profilesKey);
      } catch (error) {
        failure = error;
        transaction.abort();
      }
    };
    transaction.oncomplete = () => { database.close(); resolve(next); };
    transaction.onabort = () => {
      database.close();
      // A failed database commit must not leave a successful-looking import in
      // the recovery copy. Avoid replacing a newer writer's value on fallback.
      try {
        if (previous !== undefined && contents !== undefined && localStorage.getItem(profilesKey) === contents) {
          if (previous === null) localStorage.removeItem(profilesKey);
          else localStorage.setItem(profilesKey, previous);
        }
      } catch { /* The caller retains the pending progress and reports failure. */ }
      reject(failure ?? transaction.error);
    };
  });
}
