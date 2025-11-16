import Profile from "@/components/Profile/Profile";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { deleteAccount, selectName, selectPicture, selectUsername, signOut, updateProfile } from "@/store/auth";
import { notify } from "@/store/notifications";
import { InternalNotificationPayload } from "@/models/notification";
import Button from "@/components/common/Button/Button";
import classNames from "classnames";
import classes from "./User.module.css";
import { useRef, useState } from "react";
import Modal, { ModalRef } from "@/components/common/Modal/Modal";
import Header from "@/components/common/Header/Header";
import Logo from "@/components/common/Logo/Logo";
import { NotificationBar } from "@/components/Notifications/Notifications";
import { useNavigate } from "react-router";

const User = () => {
  const name = useAppSelector(selectName);
  const username = useAppSelector(selectUsername);
  const picture = useAppSelector(selectPicture);
  const dispatch = useAppDispatch();
  const [delBusy, setDelBusy] = useState(false);
  const [showDelConfirm, setShowDelConfirm] = useState(false);
  const showDelRef = useRef<ModalRef>(null);
  const bodyRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleSave = async (name: string, username: string) => {
    await dispatch(updateProfile({ name, username, picture })).unwrap();
  };

  const handleDelete = async () => {
    setDelBusy(true);
    const success = await dispatch(deleteAccount()).unwrap();
    if (success) {
      await dispatch(signOut());
      location.reload();
    } else {
      setDelBusy(false);
    }
  };

  return (
    <>
      {showDelConfirm && (
        <Modal
          title="del-account"
          type="pop"
          onDismiss={() => setShowDelConfirm(false)}
          ref={showDelRef}
          layer={52}
          className="p-1p5"
        >
          <div className={classes.delconfirm}>
            <h2>Are you sure ?</h2>
            <p>
              Deleting your account is an irreversible process, all the workspaces that you own will be deleted, do
              you still want to proceed ?
            </p>
            <br />
            <div className="d-flex justify-content-end gap-1">
              <Button onClick={handleDelete} busy={delBusy} disabled={delBusy}>
                Yes
              </Button>
              <Button type="secondary" onClick={() => showDelRef?.current?.close()} disabled={delBusy}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <Header
        left={
          <Button icon="chevron-right" fit className="p-0p5 rotate-180" size={1.2} onClick={() => navigate(-1)} />
        }
        center={<Logo />}
        right={<NotificationBar />}
        bodyRef={bodyRef}
      />
      <main>
        <Profile action="edit" save={handleSave} profile={{ name, username, picture }} />
        <Button
          btnType="button"
          icon="bin"
          iconProps={{ color: "#dc6161" }}
          className={classNames(["px-1 py-0p5 mx-auto mt-1", classes.deletebtn])}
          size={1.25}
          onClick={() => setShowDelConfirm(true)}
        >
          Delete Account
        </Button>
      </main>
    </>
  );
};

export default User;
