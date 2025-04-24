let db: IDBDatabase | null = null;

const openDB = async (uid?: string, version?: number) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hidedb", version);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      createSchema(database, uid);
    });

    request.addEventListener("success", () => {
      db = request.result;
      db.addEventListener("close", closeListener);
      console.log("db connected");
      resolve(db);
    });

    request.addEventListener("error", () => {
      console.log(request.error);
      reject(request.error);
    });

    request.addEventListener("blocked", (ev) => {
      console.log(ev);
      reject(ev);
    });
  });
};
const createSchema = (database: IDBDatabase, uid?: string) => {
  if (uid) {
    const keystoreName = `sshkeys:${uid}`;
    if (!database.objectStoreNames.contains(keystoreName)) {
      database.createObjectStore(keystoreName);
    }
  }
};
const schemaChange = async (uid: string) => {
  if (db!.objectStoreNames.contains(`sshkeys:${uid}`)) return;

  console.log("close start");
  await closeDB();
  console.log("close end");
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
