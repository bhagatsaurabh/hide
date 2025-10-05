import { CSSProperties, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import classes from "./CodeInput.module.css";
import { noop } from "@/utils";
import { Null } from "@/utils/types";
import { motion } from "motion/react";
import classNames from "classnames";
import { codeRegex } from "@/utils/constants";

export interface CodeInputRef {
  validate: (val: string) => string;
  invalidate: (msg: string) => void;
  focus: () => void;
  clear: (focus: boolean) => void;
}
interface CodeInputProps {
  length: number;
  sublength: number;
  onChange?: (value: string) => void;
  validator?: (val: string) => string;
  validation?: "Lazy" | "Eager" | "Off";
  className?: string;
  ref?: RefObject<Null<CodeInputRef>>;
  size?: number;
  placeholder: string;
}

const CodeInput = ({
  length,
  sublength,
  onChange = noop,
  validator = () => "",
  validation = "Lazy",
  ref,
  size = 1,
  className = "",
  placeholder,
}: CodeInputProps) => {
  const [chars, setChars] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<HTMLInputElement[]>([]);
  const [err, setErr] = useState<string>("");
  const [top, setTop] = useState(0);

  useEffect(() => {
    inputs.current[top]?.focus();
  }, [top]);

  useImperativeHandle(ref, () => ({
    validate,
    invalidate,
    focus: () => inputs.current[0]?.focus(),
    clear: (focus: boolean) => {
      setChars(Array(length).fill(""));
      void (focus && inputs.current[0]?.focus());
    },
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
    if (/^[A-HJ-KM-NP-Z2-9a-hj-km-np-z]{1}$/.test(value)) {
      if (validation === "Eager") validate(value);
      else setErr("");

      const newChars = [...chars];
      newChars[index] = value;
      setChars(newChars.map((char) => char.toUpperCase()));
      onChange(newChars.join(""));

      if (value && index < length - 1) {
        setTop(top + 1);
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, _idx: number) => {
    if (e.key === "Backspace" && top > 0) {
      const updatedChars = [...chars];
      if (top === length - 1 && chars[top]) {
        updatedChars[top] = "";
        setTop(top);
      } else {
        updatedChars[top - 1] = "";
        setTop(top - 1);
      }
      setChars(updatedChars);
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length).toUpperCase();
    if (codeRegex.test(pasted)) {
      const pastedChars = pasted.split("");
      const newChars = [...chars];
      pastedChars.forEach((char, idx) => {
        if (idx < length) newChars[idx] = char.toUpperCase();
      });
      setChars(newChars.map((char) => char.toUpperCase()));
      onChange(newChars.join(""));
      setTop(length - 1);
    }
  };
  const handleFocus = (idx: number) => {
    if (idx === top) return;
    inputs.current[top].focus();
  };

  return (
    <label className={className}>
      <div
        className={classNames([classes.code])}
        tabIndex={0}
        onFocus={() => inputs.current[top].focus()}
        data-placeholder={placeholder}
        style={
          {
            "--meta-size": `${size * 0.75}rem`,
            "--data-size": `${size}rem`,
            "--err-size": `${size * 0.88}rem`,
          } as CSSProperties
        }
      >
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
            className={classNames([classes.input, (idx + 1) % sublength === 0 ? classes.edge : ""])}
            placeholder="-"
            onFocus={() => handleFocus(idx)}
            tabIndex={-1}
          />
        ))}
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: validation !== "Off" ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className={classNames([classes["errormsg"]])}
      >
        {err}
      </motion.span>
    </label>
  );
};

export default CodeInput;
