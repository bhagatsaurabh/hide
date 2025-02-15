/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { setUser, selectStatus, setStatus, AuthStatus, handleExistingUser } from "@/store/auth";
import { auth } from "@/config/firebase";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { Unsubscribe } from "firebase/auth";
import { Nullable } from "@/utils/types";

const AuthListener = () => {
  const dispatch = useAppDispatch();

  const unsubFn = useRef<Nullable<Unsubscribe>>(null);
  const status = useAppSelector(selectStatus);
  useEffect(() => {
    if (unsubFn.current) return;

    const unsubscribe = auth.onAuthStateChanged(async (usr) => {
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
    unsubFn.current = unsubscribe;

    return () => unsubscribe();
  }, []);

  return null;
};

export default AuthListener;
