import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously } from "firebase/auth";
import type { RootState } from "@/store";
import { auth } from "@/config/firebase";
import { register } from "@/services/user";
import { isAxiosError } from "axios";

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
  status: AuthStatus;
}

const initialState: AuthState = {
  status: AuthStatus.PENDING,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
  },
});

export const handleNewUser = createAsyncThunk("auth/handle-new-user", async (_, { rejectWithValue }) => {
  try {
    await register();
  } catch (error) {
    if (isAxiosError(error)) return rejectWithValue(error.code);
    return rejectWithValue("Unexpected");
  }
});
export const handleExistingUser = createAsyncThunk("auth/handle-existing-user", async () => {});
export const signIn = createAsyncThunk<void, AuthType>("auth/sign-in", async (type, { dispatch, rejectWithValue }) => {
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
      console.log("here");
      console.log(error);
      // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
      return rejectWithValue(error);
    }
  }
});
export const signOut = createAsyncThunk("auth/sign-out", async () => {
  try {
    await auth.signOut();
    // dispatch(clearUser());
  } catch (error) {
    console.log(error);
    // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
  }
});

export const { setStatus } = authSlice.actions;

export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
