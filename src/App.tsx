import "./App.css";
import { RouterProvider } from "react-router";
import router from "./router";
import AuthListener from "./components/AuthListener/AuthListener";

function App() {
  return (
    <>
      <AuthListener />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
