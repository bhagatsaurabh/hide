import { RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Input, InputRef } from "../Input/Input";
import classes from "./EditableField.module.css";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { Textarea, TextareaRef } from "../Textarea/Textarea";
import { Null } from "@/utils/types";

export interface EditableFieldRef {
  input: RefObject<Null<InputRef & TextareaRef>>;
}

interface EditableFieldProps {
  validator: (val: string) => string;
  orgValue: string;
  placeholder?: string;
  type: string;
  displayClassName?: string;
  inputClassName?: string;
  value: string;
  onChange: (val: string) => void;
  ref: RefObject<Null<EditableFieldRef>>;
}

const EditableField = ({
  validator,
  orgValue,
  placeholder = "New value",
  type,
  displayClassName = "",
  inputClassName = "",
  value,
  onChange,
  ref,
}: EditableFieldProps) => {
  const inputRef = useRef<InputRef & TextareaRef>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleBlur = () => {
    if (inputRef.current?.err) {
      onChange(orgValue);
    }
    setIsEditing(false);
  };

  useImperativeHandle(ref, () => ({
    input: inputRef,
  }));

  useEffect(() => {
    if (isEditing) {
      inputRef?.current?.focus();
    }
  }, [isEditing]);
  useEffect(() => {
    inputRef.current?.validate(value);
  }, [value]);

  const Component = type === "textarea" ? Textarea : Input;

  return (
    <div className={classes.editable}>
      <Component
        style={{ visibility: !isEditing ? "hidden" : "visible" }}
        className={["flex-1-1-auto", inputClassName].join(" ")}
        attrs={{ spellCheck: false, autoComplete: "off" }}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        validator={validator}
        validation="Eager"
        ref={inputRef}
      >
        <span
          style={{ visibility: !isEditing ? "visible" : "hidden" }}
          className={[classes.displayname, "flex-1-1-auto p-absolute", displayClassName].join(" ")}
        >
          {value || orgValue}
        </span>
      </Component>
      <div className={classes.action}>
        <Icon name="modified" style={{ visibility: value !== orgValue ? "visible" : "hidden" }} />
        <Button size={1.5} onClick={handleEdit} className="p-0p25 c-inherit" icon="edit" fit />
      </div>
    </div>
  );
};

export default EditableField;
