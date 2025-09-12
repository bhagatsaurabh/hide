import { useLayoutEffect, useRef, useState } from "react";
import classes from "./NavMenu.module.css";
import Icon from "../common/Icon/Icon";
import { motion } from "motion/react";
import Modal, { ModalRef } from "../common/Modal/Modal";
import Button from "../common/Button/Button";
import Link from "../common/Link/Link";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";
import { useNavigate, Link as RouterLink } from "react-router";
import { useMediaQuery } from "@/hooks/media-query";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const authStatus = useAppSelector(selectStatus);
  const menuRef = useRef<ModalRef>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isHandheld = useMediaQuery("(max-width: 1024px)");

  useLayoutEffect(() => {
    if (!isHandheld && isOpen) {
      menuRef.current?.close();
    }
  }, [isHandheld, isOpen]);

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

  const signOutEnabled = authStatus === AuthStatus.SIGNED_IN || authStatus === AuthStatus.INCOMPLETE_PROFILE;
  const signInEnabled = authStatus === AuthStatus.SIGNED_OUT;

  return (
    <>
      {/* Handheld */}
      <div className={classes.actions}>
        {signOutEnabled && (
          <>
            <RouterLink to="/dashboard">
              <Button className="py-0p5 px-0p75" fit>
                Dashboard
              </Button>
            </RouterLink>
            <RouterLink to="/profile">
              <Button className="p-0p5" size={1.25} icon="guest" fit />
            </RouterLink>
            <Button className="p-0p5" size={1.25} icon="sign-out" onClick={handleSignOut} fit />
          </>
        )}
        {signInEnabled && (
          <Button className="py-0p5 px-0p75" size={1.25} onClick={handleSignIn} fit>
            Sign in
          </Button>
        )}
      </div>

      {/* Desktop */}
      <button className={classes.button} onClick={handleMenuClick} style={{ position: "relative" }}>
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
            {signOutEnabled && (
              <>
                <RouterLink className={classes.link} to="/profile">
                  Profile
                </RouterLink>
                <RouterLink className={classes.link} to="/dashboard">
                  Dashboard
                </RouterLink>
                <Button size={1.35} onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            )}
            <br />
            {signInEnabled && (
              <Button size={1.35} onClick={handleSignIn}>
                Sign in
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
