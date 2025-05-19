import { Input, InputRef } from "@/components/common/Input/Input";
import { useAppDispatch } from "@/hooks/store";
import { createNewWorkspace } from "@/store/workspace";
import { nameRegex } from "@/utils/constants";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

export const Create = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("hide-env-node-dev");
  void setImage;
  const [busy, setBusy] = useState(false);
  const nameInput = useRef<InputRef>(null);
  const descInput = useRef<InputRef>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCreateWorkspace = async () => {
    if (nameInput.current?.validate(name)) return;

    setBusy(true);
    await dispatch(createNewWorkspace({ name, description, image }));
    setBusy(false);
    navigate("/dashboard");
  };

  const validateName = (val: string) => {
    if (!val) return "Provide a name";
    if (!nameRegex.test(val)) {
      return "Enter a valid name";
    }
    return "";
  };

  return (
    <>
      <div>{"Create"}</div>
      <Input
        attrs={{ spellCheck: false, autoComplete: "off" }}
        placeholder="Name"
        type="text"
        value={name}
        onChange={setName}
        validator={validateName}
        ref={nameInput}
      />
      <Input
        attrs={{ spellCheck: false, autoComplete: "off" }}
        placeholder="Description"
        type="text"
        value={description}
        onChange={setDescription}
        ref={descInput}
      />
      <button onClick={handleCreateWorkspace}>{busy ? "..." : "New Workspace"}</button>
    </>
  );
};
