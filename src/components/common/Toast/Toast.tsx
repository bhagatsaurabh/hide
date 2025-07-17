import { ReactNode } from "react";
import classes from "./Toast.module.css";
import info from "@/assets/icons/info.svg?react";
import warning from "@/assets/icons/warning.svg?react";
import success from "@/assets/icons/success.svg?react";
import error from "@/assets/icons/error.svg?react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { dismissNotification, selectActiveNotifications } from "@/store/notifications";
import { AnimatePresence, motion } from "motion/react";
import {
  ExclusionData,
  InternalNotificationPayload,
  InternalNotificationType,
  UserNotificationPayload,
  WorkspaceInvite,
} from "@/models/notification";
import Button from "../Button/Button";
import { respondToInvitation } from "@/store/workspace";

const iconMap = {
  info,
  warning,
  success,
  error,
  "info-warning": info,
};

interface ToastProps {
  className?: string;
}

const Toast = ({ className }: ToastProps) => {
  const notifications = useAppSelector(selectActiveNotifications);
  const dispatch = useAppDispatch();

  const classNames = [classes.toast, className ?? ""];

  const handleDismiss = (id: string) => {
    dispatch(dismissNotification(id));
  };
  const handleInvitation = async(ntfn: WorkspaceInvite, accept: boolean) => {
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
              <Icon className={[classes.icon, classes[ntfn.status as InternalNotificationType]].join(" ")} />
              <h3>{ntfn.title as string}</h3>
              <Button icon="close" onClick={() => handleDismiss(ntfn.id)} fit />
            </div>
            <span className={classes.msg}>{ntfn.message as ReactNode}</span>
          </>
        );
      }
      case "workspace-invite": {
        const ntfn = notification as WorkspaceInvite;
        const Icon = iconMap["info"];
        return (
          <>
            <div className={classes.heading}>
              <Icon className={[classes.icon, classes.info].join(" ")} />
              <h3>Workspace invitation</h3>
              <Button icon="close" onClick={() => handleDismiss(ntfn.id)} fit />
            </div>
            <span className={classes.msg}>
              You've been invited by <span className={classes.mark}>{ntfn.inviterName as string}</span> to collaborate
              on their workspace
            </span>
            <div className={classes.controls}>
              <Button type="secondary" className="m-0 m-0" onClick={() => handleInvitation(ntfn, true)}>
                Accept
              </Button>
              <Button type="tertiary" className="m-0" onClick={() => handleInvitation(ntfn, false)}>
                Ignore
              </Button>
            </div>
          </>
        );
      }
      case "workspace-membership-removed": {
        const Icon = iconMap["info"];
        const ntfn = notification as ExclusionData;
        return (
          <>
            <div className={classes.heading}>
              <Icon className={[classes.icon, classes.info].join(" ")} />
              <h3>Membership removed</h3>
              <Button icon="close" onClick={() => handleDismiss(ntfn.id)} fit />
            </div>
            <span className={classes.msg}>You've been removed from workspace: {ntfn.name}</span>
          </>
        );
      }
    }
  };

  return (
    <aside className={classNames.join(" ")}>
      <ul>
        <AnimatePresence mode="popLayout">
          {notifications.map((ntfn) => {
            return (
              <motion.li
                key={ntfn.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.2 }}
                layout
              >
                {getNtfn(ntfn)}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </aside>
  );
};

export default Toast;
