import { db } from "./index";

const getSingleton = async <T>(name: string) => {
  return new Promise<T>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<T>;
      try {
        request = db.transaction(name).objectStore(name).get("default");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};
const updateSingleton = async (name: string, value: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!db) {
      reject("DB not connected");
      return;
    }
    try {
      const request = db.transaction(name, "readwrite").objectStore(name).put(value, "default");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};

const getObject = async <T>(objectStore: string, key: string) => {
  return new Promise<T>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<T>;
      try {
        request = db.transaction(objectStore).objectStore(objectStore).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};
const updateObject = async <T>(objectStore: string, key: string, value: T) => {
  return new Promise<void>((resolve, reject) => {
    if (!db) {
      reject("DB not connected");
      return;
    }
    try {
      const request = db.transaction(objectStore, "readwrite").objectStore(objectStore).put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};
const deleteObject = async (objectStore: string, key: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!db) {
      reject("DB not connected");
      return;
    }
    try {
      const request = db.transaction(objectStore, "readwrite").objectStore(objectStore).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};
const getAll = async <T>(objectStore: string) => {
  return new Promise<T[]>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<T[]>;
      try {
        request = db.transaction(objectStore).objectStore(objectStore).getAll();
        request.onsuccess = () => resolve(request.result!);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};
const getAllKeys = (objectStore: string) => {
  return new Promise<IDBValidKey[]>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<IDBValidKey[]>;
      try {
        request = db.transaction(objectStore).objectStore(objectStore).getAllKeys();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};

const iterateCursor = <T>(objectStoreName: string, indexName: string, batchSize = 20, position: number) => {
  return new Promise<{ results: T[]; cursorPosition: IDBValidKey | null }>((resolve, reject) => {
    if (!db) {
      reject("DB not connected");
      return;
    }
    const results: T[] = [];
    const store = db.transaction(objectStoreName).objectStore(objectStoreName);
    let advanceBy = position;

    const cursorRequest = store.index(indexName).openCursor(null, "prev");

    cursorRequest.onsuccess = function () {
      const cursor = cursorRequest.result;
      if (advanceBy) {
        advanceBy = 0;
        cursor?.advance(position);
        return;
      }

      if (cursor && results.length < batchSize) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve({ results, cursorPosition: cursor ? cursor.key : null });
      }
    };

    cursorRequest.onerror = () => reject(cursorRequest.error);
  });
};
async function* cursorGenerator<T>(objectStoreName: string, indexName: string, batchSize = 20) {
  let results;
  const maxCount = await getCount(objectStoreName);
  let count = 0;

  do {
    ({ results } = await iterateCursor<T>(objectStoreName, indexName, batchSize, count));
    count += results.length;
    yield results;
  } while (count < maxCount);
}
async function* stream<T>(objectStoreName: string, indexName: string) {
  const cursorIterator = cursorGenerator<T>(objectStoreName, indexName);

  for await (const value of cursorIterator) {
    yield value;
  }
}
const getCount = async (objectStore: string) => {
  return new Promise<number>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<number>;
      try {
        request = db.transaction(objectStore).objectStore(objectStore).count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};
const getIndexCount = async (objectStore: string, indexName: string, keyRange: IDBValidKey | IDBKeyRange) => {
  return new Promise<number>((resolve, reject) => {
    if (!db) reject(new Error("Cannot access database"));
    else {
      let request: IDBRequest<number>;
      try {
        request = db.transaction(objectStore).objectStore(objectStore).index(indexName).count(keyRange);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};

export {
  getSingleton,
  updateSingleton,
  getObject,
  updateObject,
  deleteObject,
  getAll,
  getAllKeys,
  getCount,
  stream,
  getIndexCount,
};
