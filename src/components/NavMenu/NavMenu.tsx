import { useRef, useState } from "react";
import classes from "./NavMenu.module.css";
import Icon from "../common/Icon/Icon";
import { motion } from "motion/react";
import Modal, { ModalRef } from "../common/Modal/Modal";
import Button from "../common/Button/Button";
import Link from "../common/Link/Link";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";
import { useNavigate, Link as RouterLink } from "react-router";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const authStatus = useAppSelector(selectStatus);
  const menuRef = useRef<ModalRef>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    if (isOpen) {
      menuRef?.current?.close();
    } else {
      setIsOpen(true);
    }
  };
  const handleSignIn = () => {
    navigate("/auth");
  };
  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <>
      <button className={classes.button} onClick={handleMenuClick}>
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? "none" : "auto",
          }}
          transition={{ ease: "easeInOut", duration: 0.15 }}
          className={classes.icon}
        >
          <Icon name="menu" size={1.25} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          transition={{ ease: "easeInOut", duration: 0.15 }}
          className={[classes.icon, classes.closeicon].join(" ")}
        >
          <Icon name="close" size={1.25} />
        </motion.div>
      </button>
      {isOpen && (
        <Modal title="menu" onDismiss={() => setIsOpen(false)} ref={menuRef} className="p-1p5" full ignoreHeader>
          <div className={classes.menu}>
            {(authStatus === AuthStatus.SIGNED_IN || authStatus === AuthStatus.INCOMPLETE_PROFILE) && (
              <>
                <RouterLink className={classes.link} to="/profile">
                  Profile
                </RouterLink>
                <RouterLink className={classes.link} to="/dashboard">
                  Dashboard
                </RouterLink>
              </>
            )}
            <br />
            {authStatus === AuthStatus.SIGNED_OUT && (
              <Button size={1.35} onClick={handleSignIn}>
                Sign in
              </Button>
            )}
            {(authStatus === AuthStatus.SIGNED_IN || authStatus === AuthStatus.INCOMPLETE_PROFILE) && (
              <Button size={1.35} onClick={handleSignOut}>
                Sign out
              </Button>
            )}
            <Link
              to="https://github.com/bhagatsaurabh/hide-server"
              icon="github"
              iconProps={{ size: 2 }}
              className="p-absolute bottom-0"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default NavMenu;
