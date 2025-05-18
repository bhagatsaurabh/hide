import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, AuthType, selectStatus, signIn } from "@/store/auth";

export const Auth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectStatus);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    } else if (status === AuthStatus.INCOMPLETE_PROFILE) {
      navigate("/complete-profile");
    }
  }, [navigate, status]);

  const handleContinue = async () => {
    setBusy(true);
    await dispatch(signIn({ type: AuthType.GUEST }));
    setBusy(false);
  };

  return (
    <>
      <div>{"Auth"}</div>
      {status === AuthStatus.PENDING ? (
        "..."
      ) : (
        <>
          <div>
            <button onClick={handleContinue}>{busy ? "..." : "Guest"}</button>
          </div>
        </>
      )}
    </>
  );
};
