import { useRef, useState } from "react";
import { useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import classes from "./Avatar.module.css";
import Modal, { ModalRef } from "../Modal/Modal";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";

export const Avatar = () => {
  const authStatus = useAppSelector(selectStatus);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<ModalRef>(null);

  const handleClick = () => {
    if (isOpen) {
      menuRef?.current?.close();
    } else {
      setIsOpen(true);
    }
  };

  return (
    authStatus === AuthStatus.SIGNED_IN && (
      <>
        <Button icon="guest" size={1.5} onClick={handleClick} className="p-0p25" fit />
        {isOpen && (
          <Modal title="options" onDismiss={() => setIsOpen(false)} ref={menuRef} className="p-1p5" full seethrough>
            <ul>
              <li>
                <Icon name="profile" size={1.5} />
                <span>Profile</span>
              </li>
              <li>
                <Icon name="sign-out" size={1.5} />
                <span>Sign out</span>
              </li>
            </ul>
          </Modal>
        )}
      </>
    )
  );
};

export default Avatar;
