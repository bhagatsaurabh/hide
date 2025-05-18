import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously, UserCredential } from "firebase/auth";
import type { RootState } from "@/store";
import { auth, db } from "@/config/firebase";
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

type UserProfile = { name: string; username: string };
export const createProfile = createAsyncThunk<boolean, UserProfile>(
  "auth/create-profile",
  async ({ name, username }, { dispatch }) => {
    try {
      await storeUser(auth.currentUser!.uid);

      await setDoc(doc(db, "users", username), {
        name,
        username,
        uid: auth.currentUser!.uid,
      });

      dispatch(setName(name));
      dispatch(setUsername(username));
    } catch (error) {
      void error;
      return false;
    }
    return true;
  }
);
export const fetchProfile = createAsyncThunk("auth/fetch-profile", async (_, { dispatch }) => {
  const qSnap = await getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser!.uid)));
  const profileSnap = qSnap.docs[0];
  if (!profileSnap || !profileSnap.exists()) return null;

  const profile = profileSnap.data();
  dispatch(setUsername(profile.username));
  dispatch(setName(profile.name));
  return profile as UserProfile;
});
export const signIn = createAsyncThunk<void, { type: AuthType }>("auth/sign-in", async ({ type }, { dispatch }) => {
  dispatch(setStatus(AuthStatus.SIGNING_IN));
  let userCred: UserCredential | null = null;

  console.log("yep");
  try {
    if (type === AuthType.GUEST) {
      userCred = await signInAnonymously(auth);
    } else {
      userCred = await signInAnonymously(auth);
    }
  } catch (error) {
    // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
    dispatch(setStatus(AuthStatus.PENDING));
    console.log(error);
    return;
  }

  if (getAdditionalUserInfo(userCred!)?.isNewUser) {
    dispatch(setStatus(AuthStatus.INCOMPLETE_PROFILE));
  } else {
    const profile = await dispatch(fetchProfile()).unwrap();
    if (profile) {
      dispatch(setStatus(AuthStatus.SIGNED_IN));
    } else {
      dispatch(setStatus(AuthStatus.INCOMPLETE_PROFILE));
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

export const { setStatus, setUsername, setName } = authSlice.actions;

export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
