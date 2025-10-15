import classes from "./Status.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import { usePrevious } from "@/hooks/prev";
import { useAppDispatch } from "@/hooks/store";
import { notify } from "@/store/notifications";
import { noop } from "@/utils";
import { socket } from "@/config/socket";
import { ProvisionPayload, ProvisionSuccess } from "@/models/workspace";
import { processNewWorkspace } from "@/store/workspace";
import { InternalNotificationPayload } from "@/models/notification";
import Button from "@/components/common/Button/Button";
import RadialProgress from "@/components/common/RadialProgress/RadialProgress";
import { AnimatePresence, motion } from "motion/react";

export const Status = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const location = useLocation();
  const workspaceName = usePrevious<string>(location.state?.workspaceName);
  const isNew = usePrevious<string>(location.state?.isNew);
  const [provStatus, setProvStatus] = useState<ProvisionPayload | null>(null);
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(true);
  const [uuid, setUuid] = useState(location.state?.wsUuid ?? "");

  useEffect(() => {
    if (!workspaceName) navigate("/dashboard", { replace: true });

    socket.on("provision", (msg) => setProvStatus(msg));
    return () => void socket.off("provision");
  }, [navigate, workspaceName]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === "Tab") {
      if (!node.current?.contains(document.activeElement)) {
        bound.current?.first?.focus();
        return;
      }
      let boundNode: HTMLElement | null | undefined;
      if (event.shiftKey) {
        boundNode = bound.current?.first;
      } else {
        boundNode = bound.current?.last;
      }
      if (document.activeElement === boundNode) {
        boundNode?.focus();
        event.preventDefault();
      }
    }
  }, []);
  const handleDismiss = useCallback(
    (to: unknown) => {
      if (show) {
        window.removeEventListener("keydown", trapFocus);
        setShow(false);
        navigate(to as string);
      }
    },
    [navigate, show, trapFocus]
  );

  useEffect(() => {
    if (provStatus?.action === "error") {
      if (isNew) {
        dispatch(
          notify({
            title: "Could not provision workspace",
            status: "error",
            message: "Something went wrong while provisioning your workspace, please try again later",
          } as InternalNotificationPayload)
        );
      } else {
        dispatch(
          notify({
            title: "Could not connect to workspace",
            status: "error",
            message: "Something went wrong while connecting to your workspace, please try again later",
          } as InternalNotificationPayload)
        );
      }
      handleDismiss(-1);
    } else if (provStatus?.action === "success") {
      if (uuid) return;
      dispatch(
        processNewWorkspace({
          workspace: (provStatus.payload as ProvisionSuccess).workspace,
          privateKey: (provStatus.payload as ProvisionSuccess).privateKey,
        })
      );
      setUuid((provStatus.payload as ProvisionSuccess).workspace.uuid);
      setBusy(false);
    } else if (provStatus?.action === "ready") {
      handleDismiss(`/env/${uuid}`);
    }
  }, [dispatch, handleDismiss, isNew, provStatus, uuid]);

  let displayStatus = `0/6:${isNew ? "Creating your workspace" : "Restoring your workspace"}`;
  if (provStatus?.action === "status") {
    displayStatus = provStatus.payload.message;
  } else if (provStatus?.action === "success") {
    // displayStatus = "Ready";
  } else if (provStatus?.action === "error") {
    displayStatus = "Error";
  }

  const [meta, msg] = displayStatus.split(":");
  const [currStep, totalSteps] = meta.split("/").map((val) => parseInt(val));

  return (
    <>
      <Backdrop show={show} onDismiss={busy ? noop : () => navigate("/dashboard")} />
      <div className={classes.status}>
        {!busy && (
          <Button
            icon="close"
            fit
            className="p-0p5 p-absolute tr-1"
            size={1}
            onClick={() => navigate("/dashboard")}
          />
        )}
        <div className={classes.heading}>
          <h2>{workspaceName}</h2>
        </div>
        <br />
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <RadialProgress currStep={currStep} totalSteps={totalSteps} msg={msg} />
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="mx-auto w-min-content"
            >
              <Button size={1.2} className="px-1 py-0p5" icon="launch" onClick={() => handleDismiss(`/env/${uuid}`)}>
                Launch
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <br />
      </div>
    </>
  );
};
