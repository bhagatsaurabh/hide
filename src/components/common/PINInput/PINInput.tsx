import { RefObject, useImperativeHandle, useRef, useState } from "react";
import classes from "./PINInput.module.css";
import { noop } from "@/utils";
import { Null } from "@/utils/types";
import { AnimatePresence, motion } from "motion/react";
import classNames from "classnames";

export interface PINInputRef {
  validate: (val: string) => string;
  invalidate: (msg: string) => void;
  focus: () => void;
}
interface PINInuptProps {
  length: number;
  onChange?: (value: string) => void;
  validator?: (val: string) => string;
  validation?: "Lazy" | "Eager" | "Off";
  className?: string;
  ref?: RefObject<Null<PINInputRef>>;
}

const PINInput = ({ length, onChange = noop, validator = () => "", validation = "Lazy", ref }: PINInuptProps) => {
  const [chars, setChars] = useState(Array(length).fill(""));
  const inputs = useRef<HTMLInputElement[]>([]);
  const [err, setErr] = useState<string>("");

  useImperativeHandle(ref, () => ({
    validate,
    invalidate,
    focus: () => inputs.current[0]?.focus(),
    err,
  }));
  const validate = (val: string) => {
    const errMsg = validator(val);
    setErr(errMsg);
    return errMsg;
  };
  const invalidate = (msg: string) => {
    setErr(msg);
  };

  const handleChange = (value: string, index: number) => {
    if (/^[a-zA-Z0-9]?$/.test(value)) {
      if (validation === "Eager") validate(value);
      else {
        setErr("");
      }

      const newChars = [...chars];
      newChars[index] = value;
      setChars(newChars);
      onChange(newChars.join(""));

      if (value && index < length - 1) {
        inputs.current[index + 1].focus();
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (/^[a-zA-Z0-9]+$/.test(pasted)) {
      const pastedChars = pasted.split("");
      const newChars = [...chars];
      pastedChars.forEach((char, idx) => {
        if (idx < length) newChars[idx] = char.toUpperCase();
      });
      setChars(newChars);
      onChange(newChars.join(""));

      const nextIdx = Math.min(pastedChars.length, length - 1);
      inputs.current[nextIdx]?.focus();
    }
  };

  return (
    <>
      <div className={classes.pin}>
        {chars.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => void (inputs.current[idx] = el!)}
            value={val}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            maxLength={1}
            inputMode="text"
            className={classes.input}
          />
        ))}
      </div>
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
    </>
  );
};

export default PINInput;
