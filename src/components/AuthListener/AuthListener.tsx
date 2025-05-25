/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { uuidv4 as uuid } from "lib0/random.js";
import { selectStatus, setStatus, AuthStatus, fetchProfile, setUsername, setName } from "@/store/auth";
import { app } from "@/config/firebase";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { connectSocket, disconnectSocket } from "@/config/socket";
import { setConnected } from "@/store/workspace";

const auth = getAuth(app);
auth.useDeviceLanguage();

const AuthListener = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        sessionStorage.setItem("sessionId", uuid());
        if (status !== AuthStatus.SIGNING_IN) {
          const profile = await dispatch(fetchProfile()).unwrap();
          if (!profile) {
            dispatch(setStatus(AuthStatus.INCOMPLETE_PROFILE));
          } else {
            dispatch(setStatus(AuthStatus.SIGNED_IN));
          }
        }
        connectSocket().then(() => dispatch(setConnected(true)));
      } else {
        sessionStorage.removeItem("sessionId");
        dispatch(setStatus(AuthStatus.SIGNED_OUT));
        dispatch(setUsername(""));
        dispatch(setName(""));
        disconnectSocket();
        setConnected(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return <></>;
};

export default AuthListener;
