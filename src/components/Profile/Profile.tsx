import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input, InputRef } from "@/components/common/Input/Input";
import { nameRegex, usernameRegex } from "@/utils/constants";
import { debounce, getCroppedImg, throttle } from "@/utils";
import { checkUsername } from "@/services/auth";
import { isAxiosError } from "axios";
import classes from "./Profile.module.css";
import Button from "@/components/common/Button/Button";
import Spinner from "@/components/common/Spinner/Spinner";
import Icon from "@/components/common/Icon/Icon";
import { User } from "@/models/user";
import Image from "../common/Image/Image";
import Modal, { ModalRef } from "../common/Modal/Modal";
import Cropper, { Area } from "react-easy-crop";
import { useAppDispatch } from "@/hooks/store";
import { notify } from "@/store/notifications";
import { InternalNotificationPayload } from "@/models/notification";
import { updateProfile, uploadAvatar } from "@/store/auth";
import { auth } from "@/config/firebase";
import classNames from "classnames";

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
  const avatarModalRef = useRef<ModalRef>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const avatarImg = useRef("");
  const croppedAvatarImg = useRef("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixels = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    return () => URL.revokeObjectURL(avatarImg.current);
  }, []);

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

  const handleCrop = useMemo(
    () =>
      throttle(async (...args: unknown[]) => {
        const [src, area] = args as [string, Area];
        const croppedImage = await getCroppedImg(src, area, 0);
        if (!croppedImage) return;

        const oldUrl = croppedAvatarImg.current;
        croppedAvatarImg.current = URL.createObjectURL(croppedImage);
        URL.revokeObjectURL(oldUrl);
        setAvatar(croppedAvatarImg.current);
      }, 500),
    []
  );
  useEffect(() => {
    return () => handleCrop.cancel();
  }, [handleCrop]);

  const handleAvatarUploadClick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      void (avatarInputRef.current && (avatarInputRef.current.value = ""));
      dispatch(
        notify({
          title: "Not an image",
          message: "Uploaded avatar file is not an image, please try again",
          status: "warning",
        } as InternalNotificationPayload)
      );
      return;
    }

    avatarImg.current = URL.createObjectURL(file);
    setEditOpen(true);
  };

  const onCropComplete = async (_croppedArea: Area, croppedAreaPixelsVal: Area) => {
    croppedAreaPixels.current = croppedAreaPixelsVal;
    handleCrop(avatarImg.current, croppedAreaPixels.current);
  };
  const handleAvatarUpload = async () => {
    setUploadBusy(true);

    const croppedImage = await getCroppedImg(avatarImg.current, croppedAreaPixels.current, 0);
    if (!croppedImage) {
      dispatch(
        notify({
          status: "error",
          title: "Avatar crop failed",
          message: "Could not crop uploaded avatar image, please try again",
        } as InternalNotificationPayload)
      );
      setUploadBusy(false);
      return;
    }

    const oldUrl = croppedAvatarImg.current;
    croppedAvatarImg.current = URL.createObjectURL(croppedImage);
    URL.revokeObjectURL(oldUrl);
    setAvatar(croppedAvatarImg.current);

    try {
      const picture = await dispatch(uploadAvatar({ data: croppedImage, uid: auth.currentUser!.uid })).unwrap();
      if (action === "edit") {
        await dispatch(updateProfile({ picture }));
      }
    } catch (error) {
      console.log(error);
      dispatch(
        notify({
          status: "error",
          title: "Avatar update failed",
          message: "Could not upload avatar image, please try again",
        } as InternalNotificationPayload)
      );
      setUploadBusy(false);
      return;
    }

    setUploadBusy(false);
    avatarModalRef.current?.close();
  };

  return (
    <>
      <div className={classes.profile}>
        {editOpen && (
          <Modal
            className="p-2"
            type="pop"
            title="avatar-select"
            onDismiss={() => {
              void (avatarInputRef.current && (avatarInputRef.current.value = ""));
              setEditOpen(false);
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
            ref={avatarModalRef}
          >
            <h2 className={classes.title}>Upload avatar</h2>
            <div className={classes.avatarselect}>
              <div className={classes.preview}>
                <h3>Preview</h3>
                <Image
                  path={avatar || "guest"}
                  alt="Avatar"
                  className="w-6 h-6 mx-auto mb-1"
                  asset={!avatar}
                  icon={!avatar}
                />
              </div>
              <div className={classes.crop}>
                <Cropper
                  image={avatarImg.current}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            </div>
            <div className={classes.actions}>
              <Button onClick={() => avatarModalRef.current?.close()} size={1.1} className="mt-1p5 px-1 py-0p5">
                Back
              </Button>
              <Button
                busy={uploadBusy}
                onClick={handleAvatarUpload}
                size={1.1}
                icon="upload"
                className="mt-1p5 px-1 py-0p5"
              >
                Upload
              </Button>
            </div>
          </Modal>
        )}
        <h2>{action === "edit" ? "Profile" : "Create Profile"}</h2>
        <form noValidate={true} className="align-items-center">
          <input
            ref={avatarInputRef}
            type="file"
            id="avatarInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarUploadClick}
          />
          <div className={classes.avatarwrap}>
            <div
              className={classNames({ [classes.avatar]: true, [classes.default]: !profile?.picture })}
              style={{ padding: !profile?.picture ? ".5rem" : 0 }}
              onClick={() => avatarInputRef.current?.click()}
            >
              <Image
                path={profile?.picture || "guest"}
                alt="Avatar"
                asset={!profile?.picture}
                icon={!profile?.picture}
                className="w-5 h-5"
                style={{ color: "#eeeeee", objectFit: "cover" }}
              />
            </div>
            <Button
              btnType="button"
              onClick={(e) => {
                e.preventDefault();
                avatarInputRef.current?.click();
              }}
              className="p-absolute p-0p25"
              icon="edit"
              size={1.25}
              fit
            />
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
                  <Icon name={usernameCheckState.type} size={1.1} status asset />
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
            btnType="button"
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
    </>
  );
};

export default Profile;
