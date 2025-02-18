import { auth } from "@/config/firebase";
import { redirect } from "react-router";

export const authGuard = async ({ request }: { request: Request }) => {
  const path = new URL(request.url).pathname;
  console.log(path, auth.currentUser);
  if (!auth.currentUser && (path.startsWith("/dashboard") || path.startsWith("/profile") || path.startsWith("/env"))) {
    throw redirect("/auth");
  }
  return null;
};

export const noAuthGuard = async () => {
  console.log(auth.currentUser);
  if (auth.currentUser) {
    throw new Error();
  }
  return null;
};
