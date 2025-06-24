import { createBrowserRouter, Outlet } from "react-router";
import { Home } from "@/pages/Home/Home";
import { Auth } from "@/pages/Auth/Auth";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { Create } from "@/pages/Create/Create";
import { Project } from "@/pages/Project/Project";
import { User } from "@/pages/User/User";
import { Environment } from "@/pages/Environment/Environment";
import { CrashBoard } from "@/components/common/CrashBoard/CrashBoard";
import { authGuard, noAuthGuard, workspaceLoader } from "./guards";
import { CreateProfile } from "@/pages/CreateProfile/CreateProfile";
import SignIn from "@/components/SignIn/SignIn";
import Providers from "@/components/Providers/Providers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <CrashBoard />,
    loader: authGuard,
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <CrashBoard />,
    loader: noAuthGuard,
    children: [
      {
        path: "",
        element: <Providers />,
        errorElement: <CrashBoard />,
        loader: noAuthGuard,
      },
      {
        path: "signin",
        element: <SignIn />,
        errorElement: <CrashBoard />,
        loader: noAuthGuard,
      },
    ],
  },
  {
    path: "/complete-profile",
    element: <CreateProfile />,
    errorElement: <CrashBoard />,
    loader: authGuard,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <CrashBoard />,
    loader: authGuard,
    children: [
      {
        path: "new",
        element: <Create />,
        errorElement: <CrashBoard />,
      },
      {
        path: ":id",
        element: <Project />,
        errorElement: <CrashBoard />,
        loader: workspaceLoader,
      },
    ],
  },
  {
    path: "/profile",
    element: <User />,
    errorElement: <CrashBoard />,
    loader: authGuard,
  },
  {
    path: "/env",
    element: <Outlet />,
    errorElement: <CrashBoard />,
    loader: authGuard,
    children: [
      {
        index: true,
        path: ":id",
        element: <Environment />,
        errorElement: <CrashBoard />,
        loader: workspaceLoader,
      },
    ],
  },
]);

export default router;
