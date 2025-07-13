import { useLoaderData, useNavigate } from "react-router";
import { workspaceLoader } from "@/router/guards";
import classes from "./Project.module.css";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import { useCallback, useRef, useState } from "react";
import { usePrevious } from "@/hooks/prev";
import { timeExpression } from "@/utils";
import MemberList from "@/components/MemberList/MemberList";
import Modal, { ModalRef } from "@/components/common/Modal/Modal";
import Button from "@/components/common/Button/Button";
import { auth } from "@/config/firebase";
import { MembershipDTO } from "@/models/workspace";
import { useAppDispatch } from "@/hooks/store";
import EditableField from "@/components/common/EditableField/EditableField";
import { validateDesc, validateName } from "@/utils/validators";

export const Project = () => {
  const wrspc = useLoaderData<typeof workspaceLoader>();
  const workspace = usePrevious(wrspc);
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const [toRemove, setToRemove] = useState<MembershipDTO | null>(null);
  const menuRef = useRef<ModalRef>(null);
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState(workspace.name);
  const [newDesc, setNewDesc] = useState(workspace.description);

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
  const handleRemoveClick = (user: MembershipDTO) => {
    setToRemove(user);
  };
  const handleMemberRemove = async () => {
    if (!toRemove) return;
    // TODO
    // await dispatch(updateExistingWorkspace());
  };

  return (
    <>
      {toRemove && (
        <Modal
          title="member-remove"
          type="pop"
          onDismiss={() => setToRemove(null)}
          ref={menuRef}
          layer={2}
          className="p-1p5"
        >
          <h2>Are you sure ?</h2>
          <p>
            Do you want to remove user @{toRemove.username} from {workspace.name} workspace ?
          </p>
          <div className="d-flex justify-content-end gap-1">
            <Button onClick={handleMemberRemove}>Yes</Button>
            <Button type="secondary" onClick={() => menuRef?.current?.close()}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
      <Backdrop show={show} onDismiss={handleDismiss} />
      <div className={classes.project}>
        <div className={classes.heading}>
          <EditableField
            validator={validateName}
            orgValue={workspace.name}
            value={newName}
            onChange={setNewName}
            type="text"
            displayClassName="fs-1p5"
            inputClassName="fs-1p5"
          />
          <span className={classes.creation}>Created&nbsp;{timeExpression(new Date(workspace.createdAt))}</span>
          <EditableField
            validator={validateDesc}
            orgValue={workspace.description}
            value={newDesc}
            onChange={setNewDesc}
            type="textarea"
            displayClassName="fs-0p85"
            inputClassName="fs-0p85"
          />
        </div>
        <div className={classes.memberlist}>
          <h3 className={classes.heading}>Members</h3>
          <MemberList
            members={workspace.memberships}
            onRemove={handleRemoveClick}
            role={workspace.memberships.find((member) => member.userId === auth.currentUser!.uid)?.role ?? "member"}
          />
        </div>
        <Button
          className="float-right"
          icon="chevron-right"
          iconProps={{ "data-position": "right" }}
          onClick={handleOpen}
        >
          Open
        </Button>
      </div>
    </>
  );
};
