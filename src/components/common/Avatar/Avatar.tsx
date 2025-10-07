import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";
import classes from "./Avatar.module.css";
import Modal, { ModalRef } from "../Modal/Modal";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { useNavigate } from "react-router";

export const Avatar = () => {
  const authStatus = useAppSelector(selectStatus);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<ModalRef>(null);
  const modalAnchor = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (isOpen) {
      menuRef?.current?.close();
    } else {
      setIsOpen(true);
    }
  };
  const handleMenuOption = async (option: string) => {
    if (option === "signout") {
      await dispatch(signOut());
      navigate("/");
    } else if (option === "profile") {
      navigate("/profile");
    }
  };

  return (
    authStatus === AuthStatus.SIGNED_IN && (
      <>
        <Button
          ref={modalAnchor}
          icon="guest"
          iconProps={{ asset: true }}
          size={1.5}
          onClick={handleClick}
          className="p-0p25"
          highlight={isOpen}
          fit
        />
        {isOpen && (
          <Modal
            anchor={modalAnchor}
            title="options"
            onDismiss={() => setIsOpen(false)}
            ref={menuRef}
            className="p-1p5"
            type="menu"
            full
            seethrough
          >
            <ul className={classes.menu}>
              <li>
                <button role="link" onClick={() => handleMenuOption("profile")}>
                  <Icon name="profile" size={1.1} asset />
                  <span>Profile</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuOption("signout")}>
                  <Icon name="sign-out" size={1.1} asset />
                  <span>Sign out</span>
                </button>
              </li>
            </ul>
          </Modal>
        )}
      </>
    )
  );
};

export default Avatar;
