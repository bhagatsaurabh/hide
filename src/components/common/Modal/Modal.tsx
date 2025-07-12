import {
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Backdrop from "../Backdrop/Backdrop";
import classes from "./Modal.module.css";
import { useAppDispatch } from "@/hooks/store";
import { NavigationType, useLocation, useNavigate, useNavigationType } from "react-router";
import { fullUrl, getSlug, trapBetween } from "@/utils";
import { setModal, setPrev } from "@/store/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Null } from "@/utils/types";

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
  type?: "slide" | "pop" | "menu";
  anchor?: RefObject<Null<HTMLElement>>;
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
  type = "slide",
  anchor,
}: ModalProps) => {
  const layerLevel = layer ?? 0;

  const [show, setShow] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const action = useNavigationType();
  const location = useLocation();
  const node = useRef<Node>(null);
  const bound = useRef<{ first: HTMLElement | null; last: HTMLElement | null }>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const classNames = [classes.modal, classes[`layer${layerLevel}`]];
  if (className) classNames.push(className);
  if (full) {
    classNames.push(classes.full);
    if (ignoreHeader) classNames.push(classes["ignore-header"]);
  }
  classNames.push(classes[type]);

  let initial, animate, exit;
  if (type === "slide") {
    initial = { opacity: 0, top: "59%" };
    animate = {
      opacity: 1,
      top: full && ignoreHeader ? "calc(50% + var(--header-height))" : "50%",
      transform: full && ignoreHeader ? "translateY(calc(-50% - var(--header-height) / 2))" : "translateY(-50%)",
    };
    exit = { opacity: 0, top: "59%" };
  } else if (type === "menu") {
    initial = { opacity: 0 };
    animate = { opacity: 1 };
    exit = { opacity: 0 };
  } else {
    initial = { opacity: 0, transform: "scale(0.95)" };
    animate = { opacity: 1, transform: "scale(1)" };
    exit = { opacity: 0, transform: "scale(0.95)" };
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
  useEffect(() => {
    if (type !== "menu" || !show || !modalRef.current || !anchor?.current) return;

    const menuEl = modalRef.current;
    const buttonEl = anchor.current;

    const menuRect = menuEl.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();

    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    const spaceRight = window.innerWidth - buttonRect.left;
    const spaceLeft = buttonRect.right;

    const shouldOpenUp = spaceBelow < menuRect.height && spaceAbove > menuRect.height;
    const shouldAlignRight = spaceRight < menuRect.width && spaceLeft > menuRect.width;

    menuEl.style.top = shouldOpenUp ? "auto" : "100%";
    menuEl.style.bottom = shouldOpenUp ? "100%" : "auto";
    menuEl.style.left = shouldAlignRight ? "auto" : "0";
    menuEl.style.right = shouldAlignRight ? "0" : "auto";
  }, [anchor, show, type]);
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
            ref={modalRef}
            key="modal"
            role="dialog"
            className={classNames.join(" ")}
            initial={initial}
            animate={animate}
            exit={exit}
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
