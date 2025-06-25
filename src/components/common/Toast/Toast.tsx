import { ReactNode } from "react";
import classes from "./Toast.module.css";
import info from "@/assets/icons/info.svg?react";
import warning from "@/assets/icons/warning.svg?react";
import success from "@/assets/icons/success.svg?react";
import error from "@/assets/icons/error.svg?react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { dismissNotification, selectActiveNotifications } from "@/store/notifications";
import { AnimatePresence, motion } from "motion/react";
import { InternalNotificationType } from "@/models/notification";
import Button from "../Button/Button";

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

  return (
    <aside className={classNames.join(" ")}>
      <ul>
        <AnimatePresence mode="popLayout">
          {notifications.map((ntfn) => {
            const Icon = iconMap[ntfn.status as InternalNotificationType];
            return (
              <motion.li
                key={ntfn.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.2 }}
                layout
              >
                <div className={classes.heading}>
                  <Icon className={[classes.icon, classes[ntfn.status as InternalNotificationType]].join(" ")} />
                  <h3>{ntfn.title as string}</h3>
                  <Button icon="close" onClick={() => handleDismiss(ntfn.id)} fit />
                </div>
                <span className={classes.msg}>{ntfn.message as ReactNode}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </aside>
  );
};

export default Toast;
