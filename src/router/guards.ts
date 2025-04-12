import { auth } from "@/config/firebase";
import store from "@/store";
import { Params, redirect } from "react-router";

export const authGuard = async ({ request }: { request: Request }) => {
  const path = new URL(request.url).pathname;
  if (!auth.currentUser && (path.startsWith("/dashboard") || path.startsWith("/profile") || path.startsWith("/env"))) {
    return redirect("/auth");
  }
  return null;
};

export const noAuthGuard = async () => {
  if (auth.currentUser) {
    throw new Error();
  }
  return null;
};

export const workspaceLoader = async ({ params }: { params: Params<"id"> }) => {
  if (!params.id) {
    return redirect("/dashboard");
  }
  const state = store.getState();
  const workspace = state.workspace.workspaces.find((ws) => ws.uuid === params.id);
  if (!workspace) {
    return redirect("/dashboard");
  }
  return workspace;
};
