import { CSSProperties, ReactNode, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import Backdrop from "../Backdrop/Backdrop";
import classes from "./Modal.module.css";
import { useAppDispatch } from "@/hooks/store";
import { NavigationType, useLocation, useNavigate, useNavigationType } from "react-router";
import { fullUrl, getSlug, trapBetween } from "@/utils";
import { setModal, setPrev } from "@/store/navigation";
import { AnimatePresence, motion } from "motion/react";

interface ModalProps {
  title: string;
  children: ReactNode;
  ref?: Ref<ModalRef>;
  onDismiss: () => void;
  layer?: number;
  ignoreHeader?: boolean;
  full?: boolean;
  className?: string;
  seethrough?: boolean;
  style?: CSSProperties;
}
export interface ModalRef {
  close: () => void;
}

const Modal = ({
  title,
  children,
  ref,
  onDismiss,
  layer,
  ignoreHeader = false,
  full = false,
  className,
  seethrough = false,
  style,
}: ModalProps) => {
  const layerLevel = layer ?? 0;

  const [show, setShow] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const action = useNavigationType();
  const location = useLocation();
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const classNames = [classes.modal, classes[`layer${layerLevel}`]];
  if (className) classNames.push(className);
  if (full) {
    classNames.push(classes.full);
    if (ignoreHeader) classNames.push(classes["ignore-header"]);
  }

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
    if (location.hash && history.state.idx === 0) {
      const path = location.pathname;
      navigate(path.substring(0, path.indexOf("#")), { replace: true });
    }
    const slug = getSlug(title);
    dispatch(setPrev(fullUrl(location)));
    dispatch(setModal(`${location.pathname}${slug}`));
    navigate(slug, { state: { popUp: true } });
    (document.activeElement as HTMLElement)?.blur();
    bound.current = trapBetween(node.current!);
    window.addEventListener("keydown", trapFocus);

    setShow(true);

    return () => {
      dispatch(setModal(null));
    };
  }, []);
  useEffect(() => {
    if (show && action === NavigationType.Pop) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
    }
  }, [location]);
  useImperativeHandle(ref, () => ({
    close: () => handleDismiss(),
  }));

  const handleDismiss = () => {
    if (show) {
      window.removeEventListener("keydown", trapFocus);
      setShow(false);
      dispatch(setPrev(`${location.pathname}${getSlug(title)}`));
      navigate(-1);
    }
  };

  return (
    <>
      <Backdrop
        show={show}
        onDismiss={handleDismiss}
        layer={layerLevel}
        ignoreHeader={ignoreHeader}
        clear={seethrough}
      />
      <AnimatePresence onExitComplete={onDismiss}>
        {show && (
          <motion.div
            key="modal"
            role="dialog"
            className={classNames.join(" ")}
            initial={{ opacity: 0, top: "59%" }}
            animate={{
              opacity: 1,
              top: full && ignoreHeader ? "calc(50% + var(--header-height))" : "50%",
              transform:
                full && ignoreHeader ? "translateY(calc(-50% - var(--header-height) / 2))" : "translateY(-50%)",
            }}
            exit={{ opacity: 0, top: "59%" }}
            transition={{ ease: "easeIn", duration: 0.15 }}
            style={style}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Modal;
