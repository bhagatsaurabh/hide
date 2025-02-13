import { createBrowserRouter } from "react-router";
import { Home } from "@/pages/Home/Home";
import { Auth } from "@/pages/Auth/Auth";
import { Features } from "@/pages/Features/Features";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { Create } from "@/pages/Create/Create";
import { Project } from "@/pages/Project/Project";
import { User } from "@/pages/User/User";
import { Environment } from "@/pages/Environment/Environment";
import { CrashBoard } from "@/components/CrashBoard/CrashBoard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/features",
    element: <Features />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <CrashBoard />,
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
      },
    ],
  },
  {
    path: "/profile",
    element: <User />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/env/:id",
    element: <Environment />,
    errorElement: <CrashBoard />,
  },
]);

export default router;
