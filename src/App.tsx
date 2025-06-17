import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import router from "./router";
import AuthListener from "./components/AuthListener/AuthListener";
import { openDB } from "./config/database";
import { Heartbeat } from "./components/Heartbeat/Heartbeat";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await openDB();
    setReady(true);
  };

  return (
    <>
      {!ready ? (
        <span>Loading...</span>
      ) : (
        <>
          <AuthListener />
          <Heartbeat />
          <RouterProvider router={router} />
        </>
      )}
    </>
  );
}

export default App;
