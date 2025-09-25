import { CSSProperties, ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Null } from "@/utils/types";
import classes from "./Textarea.module.css";
import classNames from "classnames";
import { noop } from "@/utils";
import Icon from "../Icon/Icon";

interface Attrs {
  disabled?: boolean;
  spellCheck?: boolean;
  autoComplete?: string;
}
export interface TextareaRef {
  native: HTMLTextAreaElement;
  validate: (val: string) => string;
  invalidate: (msg: string) => void;
  focus: () => void;
  err: string;
}
export interface TextareaProps {
  type?: string;
  placeholder?: string;
  attrs?: Attrs;
  noTitle?: boolean;
  validator?: (val: string) => string;
  validation?: "Lazy" | "Eager" | "Off";
  focus?: boolean;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  ref?: RefObject<Null<TextareaRef>>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  size?: number;
}

export const Textarea = ({
  placeholder = undefined,
  attrs = {},
  noTitle = false,
  validator = () => "",
  validation = "Lazy",
  focus = false,
  value,
  onChange,
  onBlur = noop,
  ref,
  className,
  style = {},
  children,
  size = 1,
}: TextareaProps) => {
  const native = useRef<Null<HTMLTextAreaElement>>(null);
  const [err, setErr] = useState<string>("");

  const dStyle = {
    ...style,
    "--data-size": `${size}rem`,
    "--meta-size": `${size * 0.75}rem`,
    "--err-size": `${size * 0.88}rem`,
  };

  useEffect(() => {
    if (focus) native.current?.focus();
  }, [focus]);
  useImperativeHandle(ref, () => ({
    native: native.current!,
    validate,
    invalidate,
    focus: () => native?.current?.focus(),
    err,
  }));

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (validation === "Eager") validate(e.target.value);
    else {
      setErr("");
      native.current?.setCustomValidity("");
    }
  };
  const validate = (val: string) => {
    const errMsg = validator(val);
    setErr(errMsg);
    native.current?.setCustomValidity(errMsg);
    return errMsg;
  };
  const invalidate = (msg: string) => {
    setErr(msg);
    native.current?.setCustomValidity(err);
  };

  return (
    <>
      <label
        className={classNames({
          [classes["input"]]: true,
          [classes["blank"]]: !value,
          [classes["no-title"]]: noTitle,
          [classes["invalid"]]: !!err,
          "mt-1p5": validation !== "Off",
          [className ?? ""]: true,
          "fs-0": true,
        })}
        data-placeholder={placeholder}
        style={dStyle}
      >
        <textarea
          className={className ?? ""}
          ref={native}
          value={value}
          onInput={handleInput}
          placeholder={noTitle ? placeholder : undefined}
          name={placeholder}
          onBlur={onBlur}
          style={dStyle}
          {...attrs}
        />
        <AnimatePresence>
          {validation !== "Off" && !!err ? (
            <motion.span
              initial={{ opacity: 0, bottom: "calc(100% - 0.2rem)" }}
              animate={{ opacity: 1, bottom: "100%" }}
              exit={{ opacity: 0, bottom: "calc(100% - 0.2rem)" }}
              className={classNames([classes["errormsg"]])}
            >
              <Icon
                size={size * 0.9}
                className="mr-0p25"
                name="info"
                statusClass="info-warning"
                strokeWidth={2}
                status
              />
              <span>{err}</span>
            </motion.span>
          ) : null}
        </AnimatePresence>
        {children}
      </label>
    </>
  );
};
