import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously, User } from "firebase/auth";
import type { RootState } from "@/store";
import { Nullable } from "@/utils/types";
import { auth } from "@/config/firebase";

export enum AuthStatus {
  PENDING,
  SIGNING_IN,
  SIGNED_IN,
  SIGNED_OUT,
}
export enum AuthType {
  GUEST,
}
interface AuthState {
  user: Nullable<User>;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  status: AuthStatus.PENDING,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
  },
});

export const handleNewUser = createAsyncThunk("auth/handle-new-user", async () => {});
export const handleExistingUser = createAsyncThunk("auth/handle-existing-user", async () => {});
export const signIn = createAsyncThunk<void, { type: AuthType; options: null }>(
  "auth/sign-in",
  async ({ type }, { dispatch }) => {
    dispatch(setStatus(AuthStatus.SIGNING_IN));
    if (type === AuthType.GUEST) {
      try {
        const result = await signInAnonymously(auth);
        if (getAdditionalUserInfo(result)?.isNewUser) {
          await dispatch(handleNewUser());
        } else {
          await dispatch(handleExistingUser());
        }
        dispatch(setStatus(AuthStatus.SIGNED_IN));
      } catch (error) {
        console.log(error);
        // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
      }
    }
  }
);
export const signOut = createAsyncThunk("auth/sign-out", async (_, { dispatch }) => {
  try {
    await auth.signOut();
    dispatch(clearUser());
  } catch (error) {
    console.log(error);
    // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
  }
});

export const { setUser, setStatus, clearUser } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
