import classes from "./Status.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import Spinner from "@/components/common/Spinner/Spinner";
import { usePrevious } from "@/hooks/prev";
import { useAppDispatch } from "@/hooks/store";
import { notify } from "@/store/notifications";
import { noop } from "@/utils";
import { socket } from "@/config/socket";
import { ProvisionPayload } from "@/models/workspace";
import { processNewWorkspace } from "@/store/workspace";

export const Status = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const location = useLocation();
  const workspaceName = usePrevious<string>(location.state?.workspaceName);
  const [provStatus, setProvStatus] = useState<ProvisionPayload | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!workspaceName) navigate("/dashboard", { replace: true });

    socket.on("provision", (msg) => setProvStatus(msg));

    return () => void socket.off("provision");
  }, []);

  useEffect(() => {
    if (provStatus?.action === "error") {
      dispatch(
        notify({
          title: "Could not provision workspace",
          status: "error",
          message: "Something went wrong while provisioning your workspace, please try again later",
        })
      );
      handleDismiss(-1);
    } else if (provStatus?.action === "success") {
      dispatch(
        processNewWorkspace({ workspace: provStatus.payload.workspace, privateKey: provStatus.payload.privateKey })
      );
      handleDismiss("/dashboard");
    }
  }, [dispatch, provStatus]);

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

  const handleDismiss = (to: unknown) => {
    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      navigate(to as unknown as string);
    }
  };
  let displayStatus = "Creating";
  if (provStatus?.action === "status") {
    displayStatus = provStatus.payload.message;
  } else if (provStatus?.action === "success") {
    displayStatus = "Ready";
  } else if (provStatus?.action === "error") {
    displayStatus = "Error";
  }

  return (
    <>
      <Backdrop show={show} onDismiss={noop} />
      <div className={classes.status}>
        <div className={classes.heading}>
          <h2>{workspaceName}</h2>
        </div>
        <br />
        <Spinner className="m-auto" size={1.3} />
        <br />
        <span className={classes.message}>{displayStatus}</span>
      </div>
    </>
  );
};
