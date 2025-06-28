import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Input, InputRef } from "@/components/common/Input/Input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, createProfile, selectStatus, setStatus } from "@/store/auth";
import { nameRegex, usernameRegex } from "@/utils/constants";
import { debounce } from "@/utils";
import { checkUsername } from "@/services/auth";
import { isAxiosError } from "axios";
import classes from "./CreateProfile.module.css";
import Button from "@/components/common/Button/Button";
import Spinner from "@/components/common/Spinner/Spinner";
import Icon from "@/components/common/Icon/Icon";
import { notify } from "@/store/notifications";

export const CreateProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const status = useAppSelector(selectStatus);
  const input = useRef<InputRef>(null);
  const [name, setName] = useState("");
  const nameInput = useRef<InputRef>(null);
  const [busy, setBusy] = useState(false);
  const [usernameCheckState, setUsernameCheckState] = useState<{
    msg: string;
    type: "success" | "warning";
  } | null>(null);

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    }
  }, [navigate, status]);

  const _checkUsernameExistence = useCallback(async (username: string) => {
    try {
      const res = await checkUsername(username);
      if (!res.data.available) {
        input.current?.invalidate(" ");
        setUsernameCheckState({ msg: "Username not available", type: "warning" });
      } else {
        setUsernameCheckState({ msg: "Username available", type: "success" });
      }
    } catch (error) {
      if (!isAxiosError(error)) {
        console.log(error);
        return;
      }
      if (error.status === 400) {
        input.current?.invalidate("Not a valid username");
      }
      setUsernameCheckState(null);
    }
  }, []);
  const checkUsernameExistence = useMemo(
    () => debounce(async (username: string) => await _checkUsernameExistence(username), 1000),
    [_checkUsernameExistence]
  );
  const handleUsernameChange = (username: string) => {
    setUsername(username);
    if (usernameRegex.test(username)) {
      checkUsernameExistence(username);
      setUsernameCheckState({ msg: "...", type: "warning" });
    } else {
      setUsernameCheckState(null);
    }
  };
  const handleContinue = async (ev: MouseEvent | FormEvent) => {
    ev.preventDefault();

    if (input.current?.validate(username)) return;
    if (nameInput.current?.validate(name)) return;

    setBusy(true);
    const success = await dispatch(createProfile({ name, username })).unwrap();
    if (success) {
      dispatch(setStatus(AuthStatus.SIGNED_IN));
    } else {
      dispatch(notify({ message: "Profile creation failed, try again", status: "error", title: "Create profile" }));
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
    <div className={classes["pending-profile"]}>
      <h2>Complete your profile</h2>
      <form onSubmit={handleContinue} noValidate={true}>
        <Input
          attrs={{ spellCheck: false, autoComplete: "off" }}
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          validator={validateName}
          ref={input}
        />

        <div className={classes.usernamestate}>
          {usernameCheckState &&
            (usernameCheckState.msg === "..." ? (
              <Spinner size={1.5} />
            ) : (
              <>
                <Icon name={usernameCheckState.type} size={1.1} status />
                <span>{usernameCheckState.msg}</span>
              </>
            ))}
        </div>
        <Input
          className="mt-2p5"
          attrs={{ spellCheck: false, autoComplete: "off" }}
          placeholder="Name"
          type="text"
          value={name}
          onChange={setName}
          validator={validateUsername}
          ref={nameInput}
        />
        <Button
          busy={busy}
          disabled={busy}
          icon="chevron-right"
          iconProps={{ "data-position": "right" }}
          size={1.25}
          onClick={(e) => handleContinue(e)}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};
