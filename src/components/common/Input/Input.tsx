import { RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Null } from "@/utils/types";
import styles from "./Input.module.css";
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
  async?: boolean;
  cancellable?: boolean;
  action?: () => Promise<boolean>;
  focus?: boolean;
  value: string;
  onChange: (val: string) => void;
  ref?: RefObject<Null<InputRef>>;
}

export const Input = ({
  type = "text",
  placeholder = undefined,
  attrs = {},
  noTitle = false,
  validator = () => "",
  validation = "Lazy",
  async = false,
  cancellable = false,
  // action = () => Promise.resolve(true),
  focus = false,
  value,
  onChange,
  ref,
}: InputProps) => {
  const native = useRef<Null<HTMLInputElement>>(null);
  const [err, setErr] = useState<string>("");
  // const org = useRef<Null<string>>(null);
  // const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (focus) native.current?.focus();
  }, []);
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
  /* const handleAction = async () => {
    setIsBusy(true);
    if (await action()) {
      org.current = value;
    }
    setIsBusy(false);
  }; */

  return (
    <>
      <span
        className={classNames({
          [styles["input"]]: true,
          [styles["blank"]]: !value,
          [styles["no-title"]]: noTitle,
          [styles["invalid"]]: !!err,
          "mt-1p5": validation !== "Off",
          async,
          cancellable,
        })}
        data-placeholder={placeholder}
      >
        <input
          ref={native}
          value={value}
          onInput={handleInput}
          type={type}
          placeholder={noTitle ? placeholder : undefined}
          // disabled={async ? (isBusy ? true : undefined) : undefined}
          {...attrs}
        />
        {(async || cancellable) && !attrs.disabled && (
          <span className={classNames([styles["controls"]])}>
            {/* <Button
        @click="handleAction"
        class="action"
        v-if="modelValue !== org"
        icon="check"
        :complementary="false"
        :spinner-size="2"
        :busy="isBusy"
        async
        circular
        flat
      />
      <Button
        @click="emit('cancel')"
        class="cancel"
        v-if="cancellable"
        icon="close"
        :complementary="false"
        circular
        flat
      /> */}
          </span>
        )}
        <AnimatePresence>
          {validation !== "Off" && !!err ? (
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              className={classNames([styles["errormsg"]])}
            >
              {err}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </>
  );
};
