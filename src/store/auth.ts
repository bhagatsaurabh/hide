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
  unsubFn: () => void;
}

const initialState: AuthState = {
  user: null,
  status: AuthStatus.PENDING,
  unsubFn: () => {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
    /* async function signOut() {
      try {
        await auth.signOut();
        user.value = null;
        name.value = null;
        encKey.value = null;
        profile.value = null;
        groups.clear();
        messages.clear();
      } catch (error) {
        console.log(error);
        notify.push({ type: 'snackbar', status: 'warn', message: 'Something went wrong, please try again' });
      }
    }
    async function verifyGuestUser(type, options) {
      if (type === 'phone') {
        const { countryCode, phone } = options;
        const provider = new PhoneAuthProvider(auth);
        try {
          const verificationId = await provider.verifyPhoneNumber(`+${countryCode}${phone}`, window.verifier);
          return verificationId;
        } catch (error) {
          window.grecaptcha.reset(captcha.widgetId);
          throw error;
        }
      } else if (type === 'code') {
        const { verificationId, code } = options;
        const credential = PhoneAuthProvider.credential(verificationId, code);
        const { user } = await linkWithCredential(auth.currentUser, credential);
        setUser(user);
        await remote.updateProfile({ phone: user.phoneNumber });
        profile.value.phone = user.phoneNumber;
      }
    }
    async function linkGuestUser(cred) {
      try {
        await linkWithCredential(auth.currentUser, cred);
        return 'ok';
      } catch (error) {
        if (error.code === 'auth/phone-number-exists') {
          notify.push({ type: 'snackbar', status: 'warn', message: 'Phone number already exists.' });
          return 'fatal';
        } else {
          notify.push({ type: 'snackbar', status: 'warn', message: 'Something went wrong, please try again' });
        }
      }
      return 'failed';
    } */
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

export const { setUser, setStatus } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
