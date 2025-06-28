import { RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Null } from "@/utils/types";
import classes from "./Input.module.css";
import classNames from "classnames";

interface Attrs {
  disabled?: boolean;
  spellCheck?: boolean;
  autoComplete?: string;
}
export interface InputRef {
  native: HTMLInputElement;
  validate: (val: string) => string;
  invalidate: (msg: string) => void;
}
interface InputProps {
  type?: string;
  placeholder?: string;
  attrs?: Attrs;
  noTitle?: boolean;
  validator?: (val: string) => string;
  validation?: "Lazy" | "Eager" | "Off";
  focus?: boolean;
  value: string;
  onChange: (val: string) => void;
  ref?: RefObject<Null<InputRef>>;
  className?: string;
}

export const Input = ({
  type = "text",
  placeholder = undefined,
  attrs = {},
  noTitle = false,
  validator = () => "",
  validation = "Lazy",
  focus = false,
  value,
  onChange,
  ref,
  className,
}: InputProps) => {
  const native = useRef<Null<HTMLInputElement>>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (focus) native.current?.focus();
  }, [focus]);
  useImperativeHandle(ref, () => ({
    native: native.current!,
    validate,
    invalidate,
  }));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        })}
        data-placeholder={placeholder}
      >
        <input
          ref={native}
          value={value}
          onInput={handleInput}
          type={type}
          placeholder={noTitle ? placeholder : undefined}
          name={placeholder}
          {...attrs}
        />
        <AnimatePresence>
          {validation !== "Off" && !!err ? (
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              className={classNames([classes["errormsg"]])}
            >
              {err}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </label>
    </>
  );
};
