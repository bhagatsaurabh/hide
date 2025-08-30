import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAdditionalUserInfo, signInAnonymously, signInWithEmailLink, UserCredential } from "firebase/auth";
import type { RootState } from "@/store";
import { auth, db } from "@/config/firebase";
import { storeUser } from "@/utils/driver";
import { collection, getDocs, query, where } from "firebase/firestore";
import { notify } from "./notifications";
import { checkNetwork } from "@/utils";
import { register } from "@/services/user";
import { InternalNotificationPayload } from "@/models/notification";
import { registerEmail, verifyEmail } from "@/services/auth";
import { VerifyEmailDTO } from "@/models/auth";

export enum AuthStatus {
  PENDING,
  SIGNING_IN,
  SIGNED_IN,
  SIGNED_OUT,
  INCOMPLETE_PROFILE,
}
export enum AuthType {
  GUEST,
  EMAIL,
}
interface AuthState {
  status: AuthStatus;
  username: string;
  name: string;
  uid: string;
}

const initialState: AuthState = {
  status: AuthStatus.PENDING,
  username: "",
  name: "",
  uid: "",
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
    setUid: (state, action: PayloadAction<string>) => {
      state.uid = action.payload;
    },
  },
});

type UserProfile = { name: string; username: string };
export const createProfile = createAsyncThunk<boolean, UserProfile>(
  "auth/create-profile",
  async ({ name, username }, { dispatch }) => {
    try {
      await storeUser(auth.currentUser!.uid);

      await register({ name, username });

      dispatch(setName(name));
      dispatch(setUsername(username));
      dispatch(setUid(auth.currentUser!.uid));
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
  dispatch(setUid(auth.currentUser!.uid));
  return profile as UserProfile;
});
export const signIn = createAsyncThunk<void, { type: AuthType; req?: unknown }>(
  "auth/sign-in",
  async ({ type, req }, { dispatch }) => {
    dispatch(setStatus(AuthStatus.SIGNING_IN));
    try {
      if (type === AuthType.GUEST) {
        await dispatch(signInGuest()).unwrap();
      } else if (type === AuthType.EMAIL) {
        await dispatch(signInEmail(req as VerifyEmailDTO)).unwrap();
      }
    } catch (error) {
      dispatch(
        notify({
          status: "error",
          title: "Could not sign in",
          message: checkNetwork("Something went wrong, please try again"),
        } as InternalNotificationPayload)
      );
      dispatch(setStatus(AuthStatus.PENDING));
      console.log(error);
    }
  }
);
export const signInGuest = createAsyncThunk<void, void>("auth/sign-in-guest", async (_, { dispatch }) => {
  let userCred: UserCredential | null = null;
  userCred = await signInAnonymously(auth);
  await dispatch(checkSignedInUser(userCred)).unwrap();
});
export const signInEmail = createAsyncThunk<void, VerifyEmailDTO>("auth/sign-in-email", async ({ email, pin }) => {
  await verifyEmail(email, pin);
});
export const checkSignedInUser = createAsyncThunk<void, UserCredential>(
  "auth/check-user",
  async (userCred, { dispatch }) => {
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
  }
);
export const signOut = createAsyncThunk("auth/sign-out", async (_, { dispatch }) => {
  try {
    dispatch(setStatus(AuthStatus.PENDING));
    await auth.signOut();
  } catch (error) {
    console.log(error);
    dispatch(
      notify({
        title: "Couldn't sign you out",
        status: "error",
        message: "Something went wrong, please try again",
      } as InternalNotificationPayload)
    );
  } finally {
    dispatch(setStatus(AuthStatus.SIGNED_OUT));
  }
});

export const { setStatus, setUsername, setName, setUid } = authSlice.actions;

export const selectStatus = (state: RootState) => state.auth.status;
export const selectUid = (state: RootState) => state.auth.uid;

export default authSlice.reducer;
