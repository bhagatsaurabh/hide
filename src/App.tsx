import "./App.css";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import router from "./router";
import AuthListener from "./components/AuthListener/AuthListener";
import { openDB } from "./config/database";
import { Heartbeat } from "./components/Heartbeat/Heartbeat";
import Toast from "./components/common/Toast/Toast";
import ContextMenu from "./components/common/ContextMenu/ContextMenu";
import { useMediaQuery } from "./hooks/media-query";
import Banner from "./components/common/Banner/Banner";
import { useAppDispatch } from "./hooks/store";
import { fetchTemplates } from "./store/env";

function App() {
  const [ready, setReady] = useState(false);
  const isHandheld = useMediaQuery("(max-width: 1024px)");
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      await openDB();
      await dispatch(fetchTemplates());
      setReady(true);
    };

    init();
  }, [dispatch]);

  return (
    <>
      {!ready ? (
        <span>Loading...</span>
      ) : (
        <>
          <AuthListener />
          <Heartbeat />
          {isHandheld ? <Toast /> : <Banner />}
          <RouterProvider router={router} />
          <ContextMenu />
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
