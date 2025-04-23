import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import wsReducer from "./workspace";
import envReducer from "./env";

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: wsReducer,
    env: envReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
