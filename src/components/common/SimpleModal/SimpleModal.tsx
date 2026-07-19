import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import Backdrop from "../Backdrop/Backdrop";
import classes from "./SimpleModal.module.css";
import { trapBetween } from "@/utils";
import { AnimatePresence, motion } from "motion/react";

interface ModalProps {
  title: string;
  children: ReactNode;
  layer?: number;
  className?: string;
  style?: CSSProperties;
  plain?: boolean;
}
export interface ModalRef {
  close: () => void;
}

const SimpleModal = ({ children, layer, className, style, plain }: ModalProps) => {
  const layerLevel = layer ?? 50;

  const [show, setShow] = useState(false);
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const classNames = [classes.modal, "scrollable"];
  if (className) classNames.push(className);
  if (plain) {
    classNames.push(classes.plain);
  }
  classNames.push(classes["pop"]);

  const initial = { opacity: 0, transform: "translate(-50%, -50%) scale(0.95)" };
  const animate = { opacity: 1, transform: "translate(-50%, -50%) scale(1)" };
  const exit = { opacity: 0, transform: "translate(-50%, -50%) scale(0.95)" };
  console.log("inner", show);

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
  useEffect(() => {
    (document.activeElement as HTMLElement)?.blur();
    bound.current = trapBetween(node.current!);
    window.addEventListener("keydown", trapFocus);

    setShow(true);

    return () => {
      if (show) {
        window.removeEventListener("keydown", trapFocus);
        setShow(false);
      }
    };
  }, []);

  return (
    <>
      <Backdrop show={show} layer={layerLevel} />
      <AnimatePresence>
        {show && (
          <motion.div
            ref={modalRef}
            key="modal"
            role="dialog"
            className={classNames.join(" ")}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{ ease: "easeIn", duration: 0.15 }}
            style={{ ...style, "--data-layer": layerLevel } as CSSProperties}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SimpleModal;
