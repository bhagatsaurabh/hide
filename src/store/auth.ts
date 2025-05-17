import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously } from "firebase/auth";
import type { RootState } from "@/store";
import { auth, db } from "@/config/firebase";
import { isAxiosError } from "axios";
import { connectSocket } from "@/config/socket";
import { storeUser } from "@/utils/driver";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

export enum AuthStatus {
  PENDING,
  SIGNING_IN,
  SIGNED_IN,
  SIGNED_OUT,
  INCOMPLETE_PROFILE,
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

export const handleNewUser = createAsyncThunk(
  "auth/handle-new-user",
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      await storeUser(auth.currentUser!.uid);

      // Set profile
      const state = getState() as RootState;
      await setDoc(doc(db, "users", state.auth.username), {
        name: state.auth.name,
        username: state.auth.username,
        uid: auth.currentUser!.uid,
      });

      // Now the user is truly existing
      await dispatch(handleExistingUser()).unwrap();
    } catch (error) {
      if (isAxiosError(error)) return rejectWithValue(error.code);
      setTimeout(() => location.reload(), 2000);
      return rejectWithValue("Unexpected");
    }
  }
);
export const fetchProfile = createAsyncThunk("auth/fetch-profile", async (_, { dispatch }) => {
  try {
    const qSnap = await getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser!.uid)));
    const profile = qSnap.docs[0].data();
    dispatch(setUsername(profile.username));
    dispatch(setName(profile.name));
    return profile as { name: string; username: string };
  } catch (error) {
    console.log(error);
  }
});
export const handleExistingUser = createAsyncThunk(
  "auth/handle-existing-user",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Fetch profile
      const profile = await dispatch(fetchProfile()).unwrap();
      if (!profile) {
        return "incomplete";
      }

      await connectSocket();
    } catch (error) {
      console.log(error);
      return rejectWithValue("Unexpected");
    }
  }
);
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
