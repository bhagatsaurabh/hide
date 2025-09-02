import { useCallback, useMemo, useRef, useState } from "react";
import { Input, InputRef } from "@/components/common/Input/Input";
import { nameRegex, usernameRegex } from "@/utils/constants";
import { debounce, noop } from "@/utils";
import { checkUsername } from "@/services/auth";
import { isAxiosError } from "axios";
import classes from "./Profile.module.css";
import Button from "@/components/common/Button/Button";
import Spinner from "@/components/common/Spinner/Spinner";
import Icon from "@/components/common/Icon/Icon";
import { User } from "@/models/user";
import Image from "../common/Image/Image";

interface ProfileProps {
  profile?: Partial<User>;
  action: "create" | "edit";
  save: (name: string, username: string) => Promise<void>;
}

const Profile = ({ profile, save, action }: ProfileProps) => {
  const [username, setUsername] = useState(profile?.username ?? "");
  const usernameInput = useRef<InputRef>(null);
  const [name, setName] = useState(profile?.name ?? "");
  const nameInput = useRef<InputRef>(null);
  const [busy, setBusy] = useState(false);
  const [usernameCheckState, setUsernameCheckState] = useState<{
    msg: string;
    type: "success" | "warning";
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const _checkUsernameExistence = useCallback(async (username: string) => {
    try {
      const res = await checkUsername(username);
      if (!res.data.available) {
        usernameInput.current?.invalidate(" ");
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
        usernameInput.current?.invalidate("Not a valid username");
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
  const handleSave = async () => {
    if (usernameInput.current?.validate(username)) return;
    if (nameInput.current?.validate(name)) return;

    setBusy(true);
    await save(name, username);
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
    <div className={classes.profile}>
      <h2>{action === "edit" ? "Profile" : "Create Profile"}</h2>
      <form onSubmit={action === "edit" ? noop : handleSave} noValidate={true} className="align-items-center">
        <div className={classes.avatarwrap}>
          <div
            className={classes.avatar}
            style={{ padding: !profile?.picture ? ".5rem" : 0 }}
            onClick={() => setEditOpen(true)}
          >
            <Image
              path={profile?.picture || "../../../assets/icons/guest.svg"}
              alt="Avatar"
              asset={!profile?.picture}
              className="w-5 h-5"
              style={{ color: "#eeeeee", objectFit: "cover" }}
            />
          </div>
          <Button className="p-absolute p-0p25" icon="edit" size={1.25} fit />
        </div>

        <Input
          attrs={{ spellCheck: false, autoComplete: "off" }}
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          validator={validateName}
          ref={usernameInput}
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
          onClick={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {action === "edit" ? "Save" : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
