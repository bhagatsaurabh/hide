import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import wsReducer from "./workspace";

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: wsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
