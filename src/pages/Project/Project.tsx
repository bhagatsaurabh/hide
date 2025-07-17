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
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import EditableField, { EditableFieldRef } from "@/components/common/EditableField/EditableField";
import { validateDesc, validateName } from "@/utils/validators";
import { selectWorkspaceById, updateExistingWorkspace } from "@/store/workspace";
import AddMembers from "@/components/AddMembers/AddMembers";

export const Project = () => {
  const workspaceId = useLoaderData<typeof workspaceLoader>();
  const wrspc = useAppSelector((state) => selectWorkspaceById(state, workspaceId))!;
  const workspace = usePrevious(wrspc);
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const [toRemove, setToRemove] = useState<MembershipDTO | null>(null);
  const diagRef = useRef<ModalRef>(null);
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState(workspace.name);
  const [newDesc, setNewDesc] = useState(workspace.description);
  const [busy, setBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const nameRef = useRef<EditableFieldRef>(null);
  const descRef = useRef<EditableFieldRef>(null);
  const [showAdd, setShowAdd] = useState(false);
  const addDiagRef = useRef<ModalRef>(null);
  const membership = workspace.memberships.find((member) => member.userId === auth.currentUser!.uid)!;

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
  const handleUpdate = async () => {
    if (nameRef.current?.input.current?.validate(newName) || descRef.current?.input.current?.validate(newDesc)) {
      return;
    }

    setUpdateBusy(true);
    await dispatch(
      updateExistingWorkspace({
        id: workspace.id,
        name: newName,
        description: newDesc,
      })
    );
    setUpdateBusy(false);
  };
  const handleDismiss = () => {
    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      navigate("/dashboard");
    }
  };
  const handleRemoveClick = (user: MembershipDTO) => {
    setToRemove(user);
  };
  const handleMemberRemove = async () => {
    if (!toRemove) return;
    const newMembers = workspace.memberships.map((membership) => membership.userId);
    newMembers.splice(
      newMembers.findIndex((uid) => toRemove.userId === uid),
      1
    );
    setBusy(true);
    await dispatch(
      updateExistingWorkspace({ name: newName, description: newDesc, id: workspace.id, members: newMembers })
    );
    setBusy(false);
    diagRef.current?.close();
  };

  return (
    <>
      {toRemove && (
        <Modal
          title="member-remove"
          type="pop"
          onDismiss={() => setToRemove(null)}
          ref={diagRef}
          layer={2}
          className="p-1p5"
        >
          <h2>Are you sure ?</h2>
          <p>
            Do you want to remove user @{toRemove.username} from {workspace.name} workspace ?
          </p>
          <div className="d-flex justify-content-end gap-1">
            <Button onClick={handleMemberRemove} busy={busy}>
              Yes
            </Button>
            <Button type="secondary" onClick={() => diagRef?.current?.close()} disabled={busy}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
      {showAdd && (
        <Modal
          title="member-add"
          type="pop"
          onDismiss={() => setShowAdd(false)}
          ref={addDiagRef}
          layer={2}
          className="p-1p5"
        >
          <AddMembers workspace={workspace} onBack={() => setShowAdd(false)} />
        </Modal>
      )}
      <Backdrop show={show} onDismiss={handleDismiss} />
      <div className={classes.project}>
        <div className={classes.heading}>
          <EditableField
            ref={nameRef}
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
            ref={descRef}
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
            role={membership.role}
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
        {membership.role === "owner" && (
          <Button className="float-right mr-1" onClick={() => setShowAdd(true)} busy={updateBusy}>
            Add Members
          </Button>
        )}
        {(newName !== workspace.name || newDesc !== workspace.description) && (
          <Button className="float-right mr-1" onClick={handleUpdate} busy={updateBusy}>
            Update
          </Button>
        )}
      </div>
    </>
  );
};
