import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

export const app = initializeApp(JSON.parse(import.meta.env.VITE_HIDE_FIREBASE_KEY));
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (
  typeof import.meta.env.VITE_EMULATION_ENABLED !== "undefined" &&
  JSON.parse(import.meta.env.VITE_EMULATION_ENABLED) === true
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8085);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
