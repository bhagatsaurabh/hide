import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import router from "./router";
import AuthListener from "./components/AuthListener/AuthListener";
import { openDB } from "./config/database";
import { Heartbeat } from "./components/Heartbeat/Heartbeat";
import Toast from "./components/common/Toast/Toast";

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
          <Toast />
          <RouterProvider router={router} />
          <div style={{ display: "none" }} id="default-title"></div>
          <div style={{ display: "none" }} id="default-activity"></div>
          <div style={{ display: "none" }} id="default-explorer"></div>
          <div style={{ display: "none" }} id="default-tabgroup"></div>
          <div style={{ display: "none" }} id="default-terminal"></div>
          <div style={{ display: "none" }} id="default-status"></div>
        </>
      )}
    </>
  );
}

export default App;
