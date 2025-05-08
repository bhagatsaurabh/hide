import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "@/styles/global.css";
import "@xterm/xterm/css/xterm.css";
import App from "./App.tsx";
import store from "@/store";
import "@/config/workers.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
