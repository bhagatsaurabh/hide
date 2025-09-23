import { Input, InputRef } from "@/components/common/Input/Input";
import classes from "./Create.module.css";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { createNewWorkspace } from "@/store/workspace";
import { nameRegex } from "@/utils/constants";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Backdrop from "@/components/common/Backdrop/Backdrop";
import Button from "@/components/common/Button/Button";
import ChipGroup, { Chip } from "@/components/common/ChipGroup/ChipGroup";
import { auth } from "@/config/firebase";
import { Textarea, TextareaRef } from "@/components/common/Textarea/Textarea";
import { selectTemplates } from "@/store/env";
import { Template } from "@/models/env";

export const Create = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const nameInput = useRef<InputRef>(null);
  const descInput = useRef<TextareaRef>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const templates = useAppSelector(selectTemplates);
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

    setBusy(true);
    const res = await dispatch(
      createNewWorkspace({
        name,
        description,
        image: (image as unknown as Template).image,
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

  const handleDismiss = () => {
    if (busy) return;

    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      navigate(-1);
    }
  };

  return (
    <>
      <Backdrop show={show} onDismiss={handleDismiss} />
      <div className={classes.create}>
        <div className={classes.heading}>
          <h2>New Workspace</h2>
          <Button onClick={handleDismiss} className="p-0p75" size={1.25} icon="close" fit />
        </div>
        <Input
          attrs={{ spellCheck: false, autoComplete: "off" }}
          placeholder="Name"
          type="text"
          value={name}
          onChange={setName}
          validator={validateName}
          ref={nameInput}
        />
        <Textarea
          className="scrollable"
          attrs={{ spellCheck: false, autoComplete: "off" }}
          placeholder="Description"
          type="text"
          value={description}
          onChange={setDescription}
          ref={descInput}
        />
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
