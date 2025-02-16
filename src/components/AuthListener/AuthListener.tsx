/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setUser, selectStatus, setStatus, AuthStatus, handleExistingUser } from "@/store/auth";
import { app } from "@/config/firebase";
import { useAppDispatch, useAppSelector } from "@/hooks/store";

const auth = getAuth(app);
auth.useDeviceLanguage();

const AuthListener = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        dispatch(setUser(usr));
        if (status !== AuthStatus.SIGNING_IN) {
          await dispatch(handleExistingUser());
          dispatch(setStatus(AuthStatus.SIGNED_IN));
        }
      } else {
        dispatch(setStatus(AuthStatus.SIGNED_OUT));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <></>;
};

export default AuthListener;
