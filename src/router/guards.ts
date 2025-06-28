import { auth } from "@/config/firebase";
import store from "@/store";
import { AuthStatus } from "@/store/auth";
import { Params, redirect } from "react-router";

export const authGuard = async ({ request }: { request: Request }) => {
  const path = new URL(request.url).pathname;

  const state = store.getState();
  if (
    auth.currentUser &&
    state.auth.status === AuthStatus.INCOMPLETE_PROFILE &&
    (path.startsWith("/dashboard") || path.startsWith("/profile") || path.startsWith("/env"))
  ) {
    return redirect("/auth/profile");
  }

  if (
    !auth.currentUser &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/profile") ||
      path.startsWith("/env") ||
      path.startsWith("/auth/profile"))
  ) {
    return redirect("/auth");
  }
  return null;
};

export const noAuthGuard = async () => {
  const state = store.getState();
  if (auth.currentUser && state.auth.status !== AuthStatus.INCOMPLETE_PROFILE) {
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
