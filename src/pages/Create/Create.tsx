import { Input, InputRef } from "@/components/common/Input/Input";
import classes from "./Create.module.css";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { createNewWorkspace, requestDedicatedAccess, selectDedicatedWorkspacesCount } from "@/store/workspace";
import { codeRegex, nameRegex } from "@/utils/constants";
import { useCallback, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import Button from "@/components/common/Button/Button";
import ChipGroup, { Chip } from "@/components/common/ChipGroup/ChipGroup";
import { auth } from "@/config/firebase";
import { Textarea, TextareaRef } from "@/components/common/Textarea/Textarea";
import { selectTemplates } from "@/store/env";
import { Template } from "@/models/env";
import Toggle from "@/components/common/Toggle/Toggle";
import InfoTip from "@/components/common/InfoTip/InfoTip";
import WorkspaceTypeInfo from "@/components/WorkspaceTypeInfo/WorkspaceTypeInfo";
import CodeInput, { CodeInputRef } from "@/components/common/CodeInput/CodeInput";
import classNames from "classnames";
import Modal, { ModalRef } from "@/components/common/Modal/Modal";

export const Create = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const location = useLocation();
  const [code, setCode] = useState(location.state?.code ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [reqBusy, setReqBusy] = useState(false);
  const showRequestRef = useRef<ModalRef>(null);
  const nameInput = useRef<InputRef>(null);
  const codeInput = useRef<CodeInputRef>(null);
  const descInput = useRef<TextareaRef>(null);
  const reasonInput = useRef<TextareaRef>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const templates = useAppSelector(selectTemplates);
  const noOfDedicatedWrspcs = useAppSelector(selectDedicatedWorkspacesCount);
  const imageChips = [
    ...templates.map((template) => ({
      ...template,
      alt: template.name,
      path: `../../../assets/icons/${template.image.substring(template.image.lastIndexOf("-") + 1)}.svg`,
      image: import.meta.env.VITE_HIDE_IMAGE_DEV ? `${template.image}-dev` : template.image,
    })),
  ].map((template, idx) => ({
    ...template,
    id: idx,
    name: template.alt,
    icon: template.path.substring(template.path.lastIndexOf("/") + 1, template.path.indexOf(".svg")),
  }));
  const [image, setImage] = useState<Chip>(imageChips[0]);
  const [isDedicated, setIsDedicated] = useState(!!location.state?.code);

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

  const handleCreateWorkspace = async () => {
    if (nameInput.current?.validate(name)) return;
    if (codeInput.current?.validate(code)) return;

    setBusy(true);
    const res = await dispatch(
      createNewWorkspace({
        name,
        description,
        image: (image as unknown as Template).image,
        dedicated: isDedicated,
        accessCode: code,
        uid: auth.currentUser!.uid,
        sessionId: sessionStorage.getItem("sessionId")!,
      })
    );
    const { success } = res.payload as { success: boolean; wait?: boolean };
    if (success) {
      navigate("/dashboard/status", { state: { workspaceName: name, wsUuid: "", isNew: true } });
    }
    setBusy(false);
  };

  const validateName = (val: string) => {
    if (!val) return "Provide a name";
    if (!nameRegex.test(val)) {
      return "Enter a valid name";
    }
    return "";
  };
  const validateCode = (val: string) => {
    if (!val) return "Provide a code";
    if (!codeRegex.test(val)) {
      return "Enter a valid code";
    }
    return "";
  };

  const handleDismiss = () => {
    if (busy) return;

    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      navigate(-1);
    }
  };
  const handleRequestAccess = async () => {
    setReqBusy(true);
    const success = await dispatch(requestDedicatedAccess({ reason })).unwrap();
    setReqBusy(false);

    if (success) {
      showRequestRef.current?.close();
    }
  };

  return (
    <>
      {showRequest && (
        <Modal
          title="request-dedicated-access"
          onDismiss={() => setShowRequest(false)}
          ref={showRequestRef}
          className="p-1p5"
          type="pop"
          layer={70}
          plain
        >
          <div className={classes.request}>
            <div className="d-flex justify-content-space-between align-items-center">
              <h2>Request access code</h2>
              <Button icon="close" className="p-0p5" size={0.9} fit onClick={() => showRequestRef.current?.close()} />
            </div>
            <h3>Let us know why (helps us to provide the access code quicker)</h3>
            <Textarea
              className="scrollable w-100p"
              attrs={{ spellCheck: false, autoComplete: "off" }}
              placeholder="Reason (optional)"
              type="text"
              value={reason}
              onChange={setReason}
              ref={reasonInput}
              size={0.9}
              validation="Off"
            />
            <Button busy={reqBusy} className="p-0p5 mt-1" size={1} onClick={handleRequestAccess}>
              Request
            </Button>
          </div>
        </Modal>
      )}
      <Backdrop show={show} onDismiss={handleDismiss} />
      <div className={classes.create}>
        <div className={classes.heading}>
          <h2 className={classes.title}>New Workspace</h2>
          <Button onClick={handleDismiss} className="p-0p75" size={1} icon="close" fit />
        </div>
        <div className={classes.wrapper}>
          <div className={classes.inputs}>
            <Input
              attrs={{ spellCheck: false, autoComplete: "off" }}
              placeholder="Name"
              type="text"
              value={name}
              onChange={setName}
              validator={validateName}
              ref={nameInput}
              size={0.9}
            />
            <Textarea
              className="scrollable"
              attrs={{ spellCheck: false, autoComplete: "off" }}
              placeholder="Description"
              type="text"
              value={description}
              onChange={setDescription}
              ref={descInput}
              size={0.9}
              validation="Off"
            />
          </div>
          <div className={classes.category}>
            <div>
              <h4 className={classes.fieldname}>
                <span>Dedicated </span>
                <InfoTip title="Workspace types" color="#f5f5dcdb">
                  <WorkspaceTypeInfo />
                </InfoTip>
              </h4>
              <Toggle on={isDedicated} onchange={setIsDedicated} className="mb-1" />
            </div>
            <div className={classNames([classes.accesscode, "mb-1p5", isDedicated ? classes.show : classes.hide])}>
              <CodeInput
                length={16}
                sublength={4}
                onChange={setCode}
                validator={validateCode}
                ref={codeInput}
                size={0.9}
                placeholder="Access code"
              />
              {!noOfDedicatedWrspcs && (
                <Button className="py-0p25 px-0p5" size={0.85} onClick={() => setShowRequest(true)}>
                  Request
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className={classes.chips}>
          <ChipGroup onChange={(chip) => setImage(chip)} value={image.id} chips={imageChips} />
        </div>
        <br />
        <Button size={1.1} onClick={handleCreateWorkspace} busy={busy}>
          Create
        </Button>
      </div>
    </>
  );
};
