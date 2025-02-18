import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Input, InputRef } from "@/components/common/Input/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, AuthType, selectStatus, signIn } from "@/store/auth";
import { nameRegex } from "@/utils/constants";

export const Auth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const status = useAppSelector(selectStatus);
  const input = useRef<InputRef>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    }
  }, [navigate, status]);

  const handleContinue = async () => {
    if (input.current?.validate(username)) return;

    setBusy(true);
    // authStore.name = username;
    await dispatch(signIn(AuthType.GUEST));
    setBusy(false);
  };
  const validateName = (val: string) => {
    if (!val) return "Provide a name";
    if (!nameRegex.test(val)) {
      return "Enter a valid name";
    }
    return "";
  };

  return (
    <>
      <div>{"Auth"}</div>
      {status === AuthStatus.PENDING ? (
        "..."
      ) : (
        <>
          <Input
            attrs={{ spellCheck: false, autoComplete: "off" }}
            placeholder="Username"
            type="text"
            value={username}
            onChange={setUsername}
            validator={validateName}
            ref={input}
          />
          <div>
            <button onClick={handleContinue}>{busy ? "..." : "Continue"}</button>
          </div>
        </>
      )}
    </>
  );
};
