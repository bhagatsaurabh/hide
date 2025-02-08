import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export const app = initializeApp(
  JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_KEY!)
);
export const auth = getAuth(app);

if (
  typeof process.env.NEXT_PUBLIC_EMULATION_ENABLED !== "undefined" &&
  JSON.parse(process.env.NEXT_PUBLIC_EMULATION_ENABLED) === true
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}
