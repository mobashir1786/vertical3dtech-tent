import type { StateStorage } from "zustand/middleware";

const DATABASE_NAME = "canopy-studio";
const STORE_NAME = "configurations";
const CONFIGURATION_KEY = "current";

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support local configuration storage."));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open configuration storage."));
    request.onblocked = () => reject(new Error("Configuration storage is blocked by another browser tab."));
  });
  return databasePromise;
}

export const configurationStorage: StateStorage = {
  async getItem() {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .get(CONFIGURATION_KEY);
      request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error("Unable to read saved configuration."));
    });
  },
  async setItem(_name, value) {
    const database = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(value, CONFIGURATION_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save configuration."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Saving configuration was cancelled."));
    });
  },
  async removeItem() {
    const database = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(CONFIGURATION_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to remove saved configuration."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Removing configuration was cancelled."));
    });
  },
};
