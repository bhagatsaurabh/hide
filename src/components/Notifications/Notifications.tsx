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

export const NotificationBar = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const ntfns = useAppSelector(selectNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<ModalRef>(null);

  useEffect(() => {
    if (authStatus === AuthStatus.SIGNED_IN) {
      dispatch(fetchNotifications());

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

    return () => {
      socket?.off("notification");
    };
  }, [authStatus, dispatch]);

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

  const handleClick = () => {
    if (isOpen) {
      menuRef?.current?.close();
    } else {
      setIsOpen(true);
    }
  };

  const handleNotificationRead = async (id: string) => {
    await readNotification({ id });
  };

  return (
    authStatus === AuthStatus.SIGNED_IN && (
      <>
        <Button icon="notifications" size={1.5} onClick={handleClick} className="p-0p25" highlight={isOpen} fit />
        {isOpen && (
          <Modal
            title="notifications"
            onDismiss={() => setIsOpen(false)}
            ref={menuRef}
            className="p-1p5"
            full
            ignoreHeader
          >
            <div className={classes.list}>{ntfns.length}</div>
            <ul>
              {ntfns.map((ntfn) => (
                <li key={ntfn.id}>
                  {ntfn.type}
                  <button onClick={() => handleNotificationRead(ntfn.id)}></button>
                </li>
              ))}
            </ul>
          </Modal>
        )}
      </>
    )
  );
};
