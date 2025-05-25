import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import wsReducer from "./workspace";
import envReducer from "./env";
import ntfnsReducer from "./notifications";

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: wsReducer,
    env: envReducer,
    notifications: ntfnsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
