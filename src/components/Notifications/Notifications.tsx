import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import {
  fetchNotifications,
  loadNotifications,
  notify,
  removeAllNotifications,
  removeNotification,
  selectNotifications,
} from "@/store/notifications";
import Modal, { ModalRef } from "../common/Modal/Modal";
import classes from "./Notifications.module.css";
import Button from "../common/Button/Button";
import { socket } from "@/config/socket";
import {
  InternalNotificationPayload,
  InternalNotificationType,
  UserNotificationPayload,
  WorkspaceInvite,
} from "@/models/notification";
import { respondToInvitation, selectConnected } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import Backdrop from "../common/Backdrop/Backdrop";
import { AnimatePresence, motion } from "motion/react";
import info from "@/assets/icons/info.svg?react";
import warning from "@/assets/icons/warning.svg?react";
import success from "@/assets/icons/success.svg?react";
import error from "@/assets/icons/error.svg?react";
import classNames from "classnames";

const iconMap = {
  info,
  warning,
  success,
  error,
  "info-warning": info,
};

interface NotificationBarProps {
  size?: number;
  className?: string;
  headerHeight?: number;
}

export const NotificationBar = ({ size = 1.25, className = "", headerHeight: _ }: NotificationBarProps) => {
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
      dispatch(loadNotifications());
      dispatch(fetchNotifications());
    }

    const handlePendingNotifications = async (notifications: UserNotificationPayload[]) => {
      dispatch(fetchNotifications(notifications));
    };
    const handleNewNotification = async (notification: UserNotificationPayload) => {
      dispatch(notify(notification));
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
      setIsDesktopOpen(!isDesktopOpen);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(removeNotification(id));
  };
  const handleNtfnsClear = () => {
    dispatch(removeAllNotifications());
  };

  const handleInvitation = async (ntfn: WorkspaceInvite, accept: boolean) => {
    await dispatch(respondToInvitation({ accept, ntfn }));
  };

  const getNtfn = (notification: UserNotificationPayload) => {
    switch (notification.type) {
      case "user": {
        const Icon = iconMap[notification.status as InternalNotificationType];
        const ntfn = notification as InternalNotificationPayload;
        return (
          <>
            <div className={classes.heading}>
              <div className={classes.left}>
                <Icon className={[classes.icon, classes[ntfn.status as InternalNotificationType]].join(" ")} />
                <span className={classes.title}>{ntfn.title as string}</span>
              </div>
              <Button
                className="p-0p5"
                iconProps={{ strokeWidth: 2 }}
                icon="bin"
                onClick={() => handleDelete(ntfn.id)}
                fit
              />
            </div>
            <span className={classes.msg}>{ntfn.message}</span>
          </>
        );
      }
      case "workspace-invite": {
        const ntfn = notification as WorkspaceInvite;
        const Icon = iconMap["info"];
        return (
          <>
            <div className={classes.heading}>
              <div className={classes.left}>
                <Icon className={[classes.icon, classes.info].join(" ")} />
                <span className={classes.title}>Workspace invitation</span>
              </div>
            </div>
            <span className={classes.msg}>
              You've been invited by <span className={classes.mark}>{ntfn.inviterName as string}</span> to collaborate
              on their workspace
            </span>
            <div className={classes.controls}>
              <Button type="secondary" className="m-0 m-0 p-0p5" onClick={() => handleInvitation(ntfn, true)} fit>
                Accept
              </Button>
              <Button type="tertiary" className="m-0 p-0p5" onClick={() => handleInvitation(ntfn, false)} fit>
                Ignore
              </Button>
            </div>
          </>
        );
      }
    }
  };

  const getList = () => (
    <>
      <div className={classes.header}>
        <h3 className={classes.title}>Notifications</h3>
        <Button className="px-0p5 py-0p25" size={0.85} onClick={handleNtfnsClear} fit>
          Clear All
        </Button>
      </div>
      <ul className={classes.ntfns}>
        <AnimatePresence mode="sync">
          {!ntfns.length && (
            <motion.li
              key={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              layout
              className={classes.emptyitem}
            >
              No new notifications
            </motion.li>
          )}
          {ntfns.map((ntfn) => (
            <motion.li
              className={classes.item}
              key={ntfn.id}
              initial={{ left: "100%", opacity: 0 }}
              animate={{ left: "0", opacity: 1 }}
              exit={{ left: "100%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              layout
            >
              {getNtfn(ntfn)}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );

  return (
    authStatus === AuthStatus.SIGNED_IN && (
      <>
        <Button
          icon="notifications"
          size={size}
          iconProps={{ strokeWidth: 2 }}
          onClick={handleClick}
          className={classNames({
            "position-relative": true,
            [classes.ntfnicon]: true,
            [classes.menuopen]: !isHandheld && isDesktopOpen,
            [className]: true,
          })}
          highlight={isHandheldOpen || isDesktopOpen}
          fit
        >
          {!!ntfns.length && <span className={classes.count}>{ntfns.length > 9 ? "9+" : ntfns.length}</span>}
        </Button>
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
                  {getList()}
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
            <div className={classes.list}>{getList()}</div>
          </Modal>
        )}
      </>
    )
  );
};
