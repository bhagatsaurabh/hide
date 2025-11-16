import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import wsReducer from "./workspace";
import envReducer from "./env";
import ntfnsReducer from "./notifications";
import navReducer from "./navigation";
import typesenseReducer from "./typesense";

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: wsReducer,
    env: envReducer,
    notifications: ntfnsReducer,
    navigation: navReducer,
    typesense: typesenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
