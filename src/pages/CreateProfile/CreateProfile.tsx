import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Input, InputRef } from "@/components/common/Input/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, createProfile, selectStatus, setStatus } from "@/store/auth";
import { nameRegex, usernameRegex } from "@/utils/constants";
import { debounce } from "@/utils";
import { checkUsername } from "@/services/auth";
import { isAxiosError } from "axios";

export const CreateProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const status = useAppSelector(selectStatus);
  const input = useRef<InputRef>(null);
  const [name, setName] = useState("");
  const nameInput = useRef<InputRef>(null);
  const [busy, setBusy] = useState(false);
  const [usernameCheckState, setUsernameCheckState] = useState("");

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    }
  }, [navigate, status]);

  const checkUsernameExistence = useMemo(
    () => debounce(async (username: string) => await _checkUsernameExistence(username), 1000),
    []
  );
  const _checkUsernameExistence = async (username: string) => {
    try {
      const res = await checkUsername(username);
      if (!res.data.available) {
        input.current?.invalidate("Username not available");
        setUsernameCheckState("");
      } else {
        setUsernameCheckState("Username available");
      }
    } catch (error) {
      if (!isAxiosError(error)) {
        console.log(error);
        return;
      }
      if (error.status === 400) {
        input.current?.invalidate("Not a valid username");
      }
      setUsernameCheckState("");
    }
  };
  const handleUsernameChange = (username: string) => {
    setUsername(username);
    if (usernameRegex.test(username)) {
      checkUsernameExistence(username);
      setUsernameCheckState("...");
    }
  };
  const handleContinue = async () => {
    if (input.current?.validate(username)) return;
    if (nameInput.current?.validate(name)) return;

    setBusy(true);
    const success = await dispatch(createProfile({ name, username })).unwrap();
    if (success) {
      dispatch(setStatus(AuthStatus.SIGNED_IN));
    } else {
      console.error("Profile creation failed, try again");
      // notify.push({ type: "snackbar", status: "warn", message: "Something went wrong, please try again" });
    }
    setBusy(false);
  };
  const validateName = (val: string) => {
    if (!val) return "Provide a name";
    if (!usernameRegex.test(val)) {
      return "Enter a valid name";
    }
    return "";
  };
  const validateUsername = (val: string) => {
    if (!val) return "Provide a name";
    if (!nameRegex.test(val)) {
      return "Enter a valid name";
    }
    return "";
  };

  return (
    <>
      <div>{"Create Profile"}</div>
      <Input
        attrs={{ spellCheck: false, autoComplete: "off" }}
        placeholder="Username"
        type="text"
        value={username}
        onChange={handleUsernameChange}
        validator={validateName}
        ref={input}
      />
      <span>{usernameCheckState}</span>
      <Input
        attrs={{ spellCheck: false, autoComplete: "off" }}
        placeholder="Name"
        type="text"
        value={name}
        onChange={setName}
        validator={validateUsername}
        ref={nameInput}
      />
      <div>
        <button onClick={handleContinue}>{busy ? "..." : "Continue"}</button>
      </div>
    </>
  );
};
