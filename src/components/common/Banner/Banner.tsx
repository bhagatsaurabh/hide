import { ReactNode } from "react";
import classes from "./Banner.module.css";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { dismissNotification, selectActiveNotifications } from "@/store/notifications";
import { AnimatePresence, motion } from "motion/react";
import {
  InternalNotificationPayload,
  InternalNotificationType,
  UserNotificationPayload,
  WorkspaceAccessRequest,
  WorkspaceDowngraded,
  WorkspaceInvite,
} from "@/models/notification";
import Button from "../Button/Button";
import { deleteAccessCode, respondToInvitation, selectWorkspaces } from "@/store/workspace";
import Copy from "../Copy/Copy";
import router from "@/router";
import { getStatusIcon } from "@/assets";

interface BannerProps {
  className?: string;
}

const Banner = ({ className }: BannerProps) => {
  const notifications = useAppSelector(selectActiveNotifications);
  const dispatch = useAppDispatch();
  const wrspcs = useAppSelector(selectWorkspaces);

  const classNames = [classes.banner, className ?? ""];

  const handleDismiss = (id: string) => {
    dispatch(dismissNotification(id));
  };
  const handleInvitation = async (ntfn: WorkspaceInvite, accept: boolean) => {
    await dispatch(respondToInvitation({ accept, ntfn }));
  };
  const handleCode = async (ntfn: WorkspaceAccessRequest, del?: boolean) => {
    if (del) {
      await dispatch(deleteAccessCode(ntfn));
      return;
    }

    router.navigate("/dashboard/new", { state: { code: ntfn.code } });
  };

  const getNtfn = (notification: UserNotificationPayload) => {
    switch (notification.type) {
      case "user": {
        const ntfn = notification as InternalNotificationPayload;
        const StatusIcon = getStatusIcon(ntfn.status);
        return (
          <>
            <div className={classes.heading}>
              <div>
                <StatusIcon className={[classes.icon, classes[ntfn.status as InternalNotificationType]].join(" ")} />
                <span className={classes.title}>{ntfn.title as string}</span>
              </div>
              <Button
                className="p-0p5 ml-auto flex-shrink-0"
                icon="close"
                iconProps={{ asset: true }}
                onClick={() => handleDismiss(ntfn.id)}
                fit
              />
            </div>
            <span className={classes.msg}>{ntfn.message as ReactNode}</span>
          </>
        );
      }
      case "workspace-invite": {
        const ntfn = notification as WorkspaceInvite;
        const StatusIcon = getStatusIcon("info");
        return (
          <>
            <div className={classes.heading}>
              <div className={classes.left}>
                <StatusIcon className={[classes.icon, classes.info].join(" ")} />
                <span className={classes.title}>Workspace invitation</span>
              </div>
              <Button
                type="primary"
                className="p-0p5 ml-auto flex-shrink-0"
                onClick={() => handleDismiss(ntfn.id)}
                iconProps={{ strokeWidth: 2, asset: true }}
                icon="close"
                fit
              />
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
      case "workspace-access-code": {
        const ntfn = notification as WorkspaceAccessRequest;
        const StatusIcon = getStatusIcon("info");
        return (
          <>
            <div className={classes.heading}>
              <div className={classes.left}>
                <StatusIcon className={[classes.icon, classes.info].join(" ")} />
                <span className={classes.title}>Dedicated workspace access-code</span>
              </div>
              <Button
                type="primary"
                className="p-0p5 ml-auto flex-shrink-0"
                onClick={() => handleDismiss(ntfn.id)}
                iconProps={{ strokeWidth: 2, asset: true }}
                icon="close"
                fit
              />
            </div>
            <span className={classes.msg}>
              You've received an access code to create a new dedicated workspace ! This access code will stay valid
              for 5 days only.
              <br />
              <span className={classes.code}>{ntfn.code}</span>
              <Copy value={() => ntfn.code} />
            </span>
            <div className={classes.controls}>
              <Button type="secondary" className="m-0 m-0 p-0p5" onClick={() => handleCode(ntfn, false)} fit>
                Use
              </Button>
              <Button type="tertiary" className="m-0 p-0p5" onClick={() => handleCode(ntfn, true)} fit>
                Delete
              </Button>
            </div>
          </>
        );
      }
      case "workspace-downgraded": {
        const ntfn = notification as WorkspaceDowngraded;
        const wrspc = wrspcs.workspaces.find((wrspc) => wrspc.uuid === ntfn.uuid);
        const StatusIcon = getStatusIcon("info");
        return (
          <>
            <div className={classes.heading}>
              <div className={classes.left}>
                <StatusIcon className={[classes.icon, classes.info].join(" ")} />
                <span className={classes.title}>Workspace downgraded</span>
              </div>
              <Button
                type="primary"
                className="p-0p5 ml-auto flex-shrink-0"
                onClick={() => handleDismiss(ntfn.id)}
                iconProps={{ strokeWidth: 2, asset: true }}
                icon="close"
                fit
              />
            </div>
            <span className={classes.msg}>
              Your workspace <span className={classes.mark}>{`${wrspc?.name ?? "Unknown"}`}</span> has been downgraded
              to spot
            </span>
          </>
        );
      }
    }
  };

  return (
    <aside className={classNames.join(" ")}>
      <ul>
        <AnimatePresence mode="popLayout">
          {notifications
            .slice()
            .reverse()
            .map((ntfn) => {
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

export default Banner;
