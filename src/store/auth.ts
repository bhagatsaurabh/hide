import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthErrorCodes,
  getAdditionalUserInfo,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInAnonymously,
  signInWithCustomToken,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import type { RootState } from "@/store";
import { auth, db, storage } from "@/config/firebase";
import { storeUser } from "@/utils/driver";
import { collection, getDocs, query, where } from "firebase/firestore";
import { notify } from "./notifications";
import { checkNetwork, convertToPng } from "@/utils";
import { register } from "@/services/user";
import { InternalNotificationPayload } from "@/models/notification";
import { verifyEmail } from "@/services/auth";
import { VerifyEmailDTO } from "@/models/auth";
import { isAxiosError } from "axios";
import { errorMap, UserError } from "@/utils/constants";
import { FirebaseError } from "firebase/app";
import { User } from "@/models/user";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const githubAuthProvider = new GithubAuthProvider();
githubAuthProvider.addScope("read:user");
const googleAuthProvider = new GoogleAuthProvider();
const microsoftAuthProvider = new OAuthProvider("microsoft.com");

export enum AuthStatus {
  PENDING,
  SIGNING_IN,
  SIGNED_IN,
  SIGNED_OUT,
  INCOMPLETE_PROFILE,
}
export enum AuthType {
  GUEST = "guest",
  EMAIL = "email",
  GITHUB = "github",
  GOOGLE = "google",
  MICROSOFT = "microsoft",
}
interface AuthState {
  status: AuthStatus;
  username: string;
  name: string;
  uid: string;
  picture: string;
}

const initialState: AuthState = {
  status: AuthStatus.PENDING,
  username: "",
  name: "",
  uid: "",
  picture: "",
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
    setPicture: (state, action: PayloadAction<string>) => {
      state.picture = action.payload;
    },
  },
});

export const createProfile = createAsyncThunk<boolean, Pick<User, "name" | "username" | "picture">>(
  "auth/create-profile",
  async ({ name, username, picture }, { dispatch }) => {
    try {
      await storeUser(auth.currentUser!.uid);

      await register({ name, username, picture });

      dispatch(setName(name));
      dispatch(setUsername(username));
      dispatch(setUid(auth.currentUser!.uid));
      dispatch(setPicture(picture));
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
  return profile as Partial<User>;
});
export const signIn = createAsyncThunk<UserError | void | undefined, { type: AuthType; req?: unknown }>(
  "auth/sign-in",
  async ({ type, req }, { dispatch }) => {
    dispatch(setStatus(AuthStatus.SIGNING_IN));
    try {
      let res: UserError | void | undefined;
      if (type === AuthType.GUEST) {
        res = await dispatch(signInGuest()).unwrap();
      } else if (type === AuthType.EMAIL) {
        res = await dispatch(signInEmail(req as VerifyEmailDTO)).unwrap();
      } else if (type === AuthType.GITHUB) {
        res = await dispatch(signInGitHub()).unwrap();
      } else if (type === AuthType.GOOGLE) {
        res = await dispatch(signInGoogle()).unwrap();
      } else if (type === AuthType.MICROSOFT) {
        res = await dispatch(signInMicrosoft()).unwrap();
      }
      return res;
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
export const signInGuest = createAsyncThunk<UserError | void | undefined, void>(
  "auth/sign-in-guest",
  async (_, { dispatch }) => {
    const userCred = await signInAnonymously(auth);
    await dispatch(checkSignedInUser(userCred)).unwrap();
  }
);
export const signInEmail = createAsyncThunk<UserError | void | undefined, VerifyEmailDTO>(
  "auth/sign-in-email",
  async ({ email, code }, { dispatch }) => {
    try {
      const res = await verifyEmail(email, code.toUpperCase());
      const { token } = res.data;
      const userCred = await signInWithCustomToken(auth, token);
      await dispatch(checkSignedInUser(userCred)).unwrap();
    } catch (error) {
      if (!isAxiosError(error) || !errorMap[error.response?.data.message]) {
        console.log(error);
        dispatch(
          notify({
            status: "error",
            title: "Sign in failed",
            message: "Something went wrong while verifying your email, please try again",
          } as InternalNotificationPayload)
        );
        return;
      }
      return errorMap[error.response?.data.message];
    }
  }
);
export const signInGitHub = createAsyncThunk<UserError | void | undefined>(
  "auth/sign-in-github",
  async (_, { dispatch }) => {
    try {
      const userCred = await signInWithPopup(auth, githubAuthProvider);
      dispatch(setPicture(userCred.user.photoURL ?? ""));
      await dispatch(checkSignedInUser(userCred)).unwrap();
    } catch (error) {
      if ((error as FirebaseError).code === AuthErrorCodes.NEED_CONFIRMATION) {
        dispatch(
          notify({
            status: "error",
            title: "Account already exists",
            message: "Account already exists with the same email",
          } as InternalNotificationPayload)
        );
        return;
      }
      dispatch(
        notify({
          status: "error",
          title: "Sign-in failed",
          message: "Something went wrong when signing you in, please try again",
        } as InternalNotificationPayload)
      );
    }
  }
);
export const signInGoogle = createAsyncThunk<UserError | void | undefined>(
  "auth/sign-in-google",
  async (_, { dispatch }) => {
    try {
      const userCred = await signInWithPopup(auth, googleAuthProvider);
      dispatch(setPicture(userCred.user.photoURL ?? ""));
      await dispatch(checkSignedInUser(userCred)).unwrap();
    } catch (error) {
      if ((error as FirebaseError).code === AuthErrorCodes.NEED_CONFIRMATION) {
        dispatch(
          notify({
            status: "error",
            title: "Account already exists",
            message: "Account already exists with the same email",
          } as InternalNotificationPayload)
        );
        return;
      }
      dispatch(
        notify({
          status: "error",
          title: "Sign-in failed",
          message: "Something went wrong when signing you in, please try again",
        } as InternalNotificationPayload)
      );
    }
  }
);
export const signInMicrosoft = createAsyncThunk<UserError | void | undefined>(
  "auth/sign-in-microsoft",
  async (_, { dispatch }) => {
    try {
      const userCred = await signInWithPopup(auth, microsoftAuthProvider);
      let picture = "";
      try {
        const res = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
          method: "GET",
          headers: { Authorization: "" },
        });
        const pngBlob = await convertToPng(await res.blob());
        if (!pngBlob) throw new Error("Could not convert profile image to png");
        const profileImageRef = ref(storage, `users/${userCred.user.uid}/avatar.png`);
        await uploadBytes(profileImageRef, pngBlob);
        picture = await getDownloadURL(profileImageRef);
      } catch (error) {
        console.log(error);
      }
      dispatch(setPicture(picture));
      await dispatch(checkSignedInUser(userCred)).unwrap();
    } catch (error) {
      if ((error as FirebaseError).code === AuthErrorCodes.NEED_CONFIRMATION) {
        dispatch(
          notify({
            status: "error",
            title: "Account already exists",
            message: "Account already exists with the same email",
          } as InternalNotificationPayload)
        );
        return;
      }
      dispatch(
        notify({
          status: "error",
          title: "Sign-in failed",
          message: "Something went wrong when signing you in, please try again",
        } as InternalNotificationPayload)
      );
    }
  }
);
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

export const { setStatus, setUsername, setName, setUid, setPicture } = authSlice.actions;

export const selectStatus = (state: RootState) => state.auth.status;
export const selectUid = (state: RootState) => state.auth.uid;
export const selectName = (state: RootState) => state.auth.name;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectPicture = (state: RootState) => state.auth.picture;

export default authSlice.reducer;
