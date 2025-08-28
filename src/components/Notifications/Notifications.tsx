import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import { fetchNotifications, pushNotification, selectNotifications, setPending } from "@/store/notifications";
import { readNotification } from "@/services/notifications";
import Modal, { ModalRef } from "../common/Modal/Modal";
import classes from "./Notifications.module.css";
import Button from "../common/Button/Button";
import { socket } from "@/config/socket";
import { UserNotificationPayload, WorkspaceInvite } from "@/models/notification";
import { getDetails } from "@/services/user";
import { selectConnected } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import Backdrop from "../common/Backdrop/Backdrop";
import { AnimatePresence, motion } from "motion/react";

export const NotificationBar = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const ntfns = useAppSelector(selectNotifications);
  const [isHandheldOpen, setIsHandheldOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const ntfnsRef = useRef<ModalRef>(null);
  const connected = useAppSelector(selectConnected);
  const isHandheld = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    if (authStatus === AuthStatus.SIGNED_IN) {
      dispatch(fetchNotifications());
    }

    const handlePendingNotifications = (notifications: UserNotificationPayload[]) => {
      dispatch(setPending(notifications));
    };
    const handleNewNotification = async (notification: UserNotificationPayload) => {
      if (notification.type === "workspace-invite") {
        try {
          const res = await getDetails((notification as WorkspaceInvite).inviterId);
          notification.inviterName = res.data.name;
          notification.inviterUsername = res.data.username;
        } catch (error) {
          console.log(error);
          notification.inviterName = "Unknown";
          notification.inviterUsername = "Unknown";
        }
      }
      dispatch(pushNotification(notification));
    };

    if (connected) {
      socket?.on("notification", (msg) => {
        switch (msg.action) {
          case "pending": {
            handlePendingNotifications(msg.payload);
            break;
          }
          case "new": {
            handleNewNotification(msg.payload);
            break;
          }
          default:
            break;
        }
      });
    }

    return () => void socket?.off("notification");
  }, [authStatus, connected, dispatch]);

  useEffect(() => {
    if (!isHandheld && isHandheldOpen) {
      ntfnsRef?.current?.close();
    }
  }, [isHandheld, isHandheldOpen]);

  const handleClick = () => {
    if (isHandheld) {
      if (isHandheldOpen) {
        ntfnsRef?.current?.close();
      } else {
        setIsHandheldOpen(true);
      }
    } else {
      setIsDesktopOpen(!isHandheldOpen);
    }
  };

  const handleNtfnsClear = () => {
    // TODO
  };
  const handleNotificationRead = async (id: string) => {
    await readNotification({ id });
  };

  return (
    authStatus === AuthStatus.SIGNED_IN && (
      <>
        <Button
          icon="notifications"
          size={1.25}
          iconProps={{ strokeWidth: 2 }}
          onClick={handleClick}
          className="p-0p5"
          highlight={isHandheldOpen || isDesktopOpen}
          fit
        />
        {isDesktopOpen && (
          <>
            <Backdrop show={isDesktopOpen} onDismiss={() => setIsDesktopOpen(false)} clear />
            <AnimatePresence onExitComplete={() => setIsDesktopOpen(false)}>
              {isDesktopOpen && (
                <motion.div
                  key="modal"
                  role="dialog"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ ease: "easeIn", duration: 0.15 }}
                  className={classes.menu}
                >
                  <div className={classes.header}>
                    <h3 className={classes.title}>Notifications</h3>
                    <Button className="px-0p5 py-0p25" size={0.85} onClick={handleNtfnsClear} fit>
                      Clear All
                    </Button>
                  </div>
                  <ul className={classes.ntfns}>
                    {!ntfns.length && <li className={classes.emptyitem}>No new notifications</li>}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        {isHandheldOpen && (
          <Modal
            title="notifications"
            onDismiss={() => setIsHandheldOpen(false)}
            ref={ntfnsRef}
            className="p-1p5"
            full
            ignoreHeader
          >
            <div className={classes.ntfnslist}>
              <div className={classes.list}>{ntfns.length}</div>
              <ul>
                {ntfns.map((ntfn) => (
                  <li key={ntfn.id}>
                    {ntfn.type}
                    <button onClick={() => handleNotificationRead(ntfn.id)}></button>
                  </li>
                ))}
              </ul>
            </div>
          </Modal>
        )}
      </>
    )
  );
};
