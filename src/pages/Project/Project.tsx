import { useLoaderData, useNavigate } from "react-router";
import { workspaceLoader } from "@/router/guards";
import classes from "./Project.module.css";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import { useCallback, useRef, useState } from "react";
import { usePrevious } from "@/hooks/prev";
import { timeExpression } from "@/utils";
import MemberList from "@/components/MemberList/MemberList";

export const Project = () => {
  const wrspc = useLoaderData<typeof workspaceLoader>();
  const workspace = usePrevious(wrspc);
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);

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

  const handleOpen = () => {
    navigate(`/env/${workspace.uuid}`);
  };
  const handleDismiss = () => {
    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      navigate(-1);
    }
  };
  const handleMemberRemove = (uid: string) => {};

  return (
    <>
      <Backdrop show={show} onDismiss={handleDismiss} />
      <div className={classes.project}>
        <div className={classes.heading}>
          <h2 className={[classes.name, "mt-0 mb-0p25"].join(" ")}>{workspace.name}</h2>
          <span className={classes.creation}>Created&nbsp;{timeExpression(new Date(workspace.createdAt))}</span>
          <p className={classes.desc}>{workspace.description}</p>
        </div>
        <div className={classes.memberlist}>
          <h3 className={classes.heading}>Members</h3>
          <MemberList members={workspace.memberships} onRemove={handleMemberRemove} />
        </div>
        <button onClick={handleOpen}>Open</button>
      </div>
    </>
  );
};
