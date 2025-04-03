let db: IDBDatabase;

const openDB = async (uid: string, version?: number) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ocdb", version);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      createSchema(database, uid);
    });

    request.addEventListener("success", () => {
      db = request.result;
      db.addEventListener("close", closeListener);
      resolve(db);
    });

    request.addEventListener("error", () => {
      reject(request.error);
    });

    request.addEventListener("blocked", () => {
      reject(request.error);
    });
  });
};
const createSchema = (database: IDBDatabase, uid: string) => {
  if (!database.objectStoreNames.contains(`sshkeys:${uid}`)) {
    database.createObjectStore(`sshkeys:${uid}`);
  }
};
const closeDB = () => {
  db?.removeEventListener("close", closeListener);
  db?.close();
};
function closeListener(this: IDBOpenDBRequest) {
  console.log(this.error);
}

export { db, openDB, closeDB };
