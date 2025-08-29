let db: IDBDatabase | null = null;

const openDB = async (uid?: string, version?: number) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hidedb", version);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      createSchema(database, uid, ["sshkeys", "notifications"]);
    });

    request.addEventListener("success", () => {
      db = request.result;
      db.addEventListener("close", closeListener);
      resolve(db);
    });

    request.addEventListener("error", () => {
      console.log(request.error);
      reject(request.error);
    });

    request.addEventListener("blocked", (ev) => {
      reject(ev);
    });
  });
};
const createSchema = (database: IDBDatabase, uid?: string, objectStores?: string[]) => {
  if (uid && objectStores) {
    objectStores.forEach((objectStore) => {
      const objectStoreName = `${objectStore}:${uid}`;
      if (!database.objectStoreNames.contains(objectStoreName)) {
        database.createObjectStore(objectStoreName);
      }
    });
  }
};
const schemaChange = async (uid: string) => {
  if (db!.objectStoreNames.contains(`sshkeys:${uid}`)) return;

  await closeDB();
  await openDB(uid, db!.version + 1);
};
const closeDB = async () => {
  db?.addEventListener("close", closeListener);
  db?.close();
};
function closeListener(this: IDBOpenDBRequest) {
  db = null;
  console.log(this.error);
}

export { db, openDB, schemaChange, closeDB };
