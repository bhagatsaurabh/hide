import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/flows",
    element: <Flows />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/flows/:id",
    element: <Editor />,
    errorElement: <CrashBoard />,
  },
]);

export default router;
