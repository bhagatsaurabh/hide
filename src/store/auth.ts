import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously } from "firebase/auth";
import type { RootState } from "@/store";
import { auth } from "@/config/firebase";
import { register } from "@/services/user";
import { isAxiosError } from "axios";
import { connectSocket } from "@/config/socket";
import { storeUser } from "@/utils/driver";

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
  username: string;
  name: string;
}

const initialState: AuthState = {
  status: AuthStatus.PENDING,
  username: "",
  name: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const handleNewUser = createAsyncThunk("auth/handle-new-user", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    await register({ name: state.auth.name, username: state.auth.username });
    await storeUser(auth.currentUser!.uid);
  } catch (error) {
    if (isAxiosError(error)) return rejectWithValue(error.code);
    return rejectWithValue("Unexpected");
  }
});
export const handleExistingUser = createAsyncThunk("auth/handle-existing-user", async (_, { rejectWithValue }) => {
  try {
    await connectSocket();
  } catch (error) {
    console.log(error);
    return rejectWithValue("Unexpected");
  }
});
export const signIn = createAsyncThunk<void, { type: AuthType; name: string; username: string }>(
  "auth/sign-in",
  async ({ type, name, username }, { dispatch, rejectWithValue }) => {
    dispatch(setStatus(AuthStatus.SIGNING_IN));
    if (type === AuthType.GUEST) {
      try {
        const result = await signInAnonymously(auth);
        dispatch(setUsername(username));
        dispatch(setName(name));
        if (getAdditionalUserInfo(result)?.isNewUser) {
          await dispatch(handleNewUser()).unwrap();
        } else {
          await dispatch(handleExistingUser()).unwrap();
        }
        dispatch(setStatus(AuthStatus.SIGNED_IN));
      } catch (error) {
        console.log(error);
        // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
        return rejectWithValue(error);
      }
    }
  }
);
export const signOut = createAsyncThunk("auth/sign-out", async () => {
  try {
    await auth.signOut();
    // dispatch(clearUser());
  } catch (error) {
    console.log(error);
    // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
  }
});

export const { setStatus, setUsername, setName } = authSlice.actions;

export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
