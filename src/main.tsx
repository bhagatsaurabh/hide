import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "@/styles/global.css";
import "@xterm/xterm/css/xterm.css";
import App from "./App.tsx";
import store from "@/store";
import "@/config/workers.ts";
import "@/styles/utils.css";
import TooltipProvider from "./context/tooltip/TooltipProvider.tsx";
import { enableMapSet } from "immer";

enableMapSet();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </Provider>
);
