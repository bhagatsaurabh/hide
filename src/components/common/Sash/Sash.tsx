import { CSSProperties, useContext, useRef, useState } from "react";
import classes from "./Sash.module.css";
import classNames from "classnames";
import { ViewContext } from "@/context/view/view.context";
import Icon from "../Icon/Icon";

interface SashProps {
  direction: "row" | "column";
  onDrag: (start: number, current: number) => void;
  onDragStart: () => void;
  active: boolean;
  style?: CSSProperties;
}

const Sash = ({ direction, onDrag, onDragStart, active, style = {} }: SashProps) => {
  const { isMobile } = useContext(ViewContext)!;
  const [dragging, setDragging] = useState(false);
  const _dragging = useRef(false);
  const lastPos = useRef(0);
  const startPos = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active) return;
    _dragging.current = true;
    setDragging(true);
    startPos.current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = startPos.current;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    onDragStart();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!_dragging.current) return;
    const current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = current;
    onDrag(startPos.current, current);
  };

  const onPointerUp = () => {
    _dragging.current = false;
    setDragging(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
  return (
    <div
      style={style}
      className={classNames({
        [classes.handheld]: isMobile,
        [classes.sash]: true,
        [classes[direction]]: true,
        [classes.active]: active,
        [classes.dragging]: dragging,
      })}
      onPointerDown={onPointerDown}
    >
      {isMobile && (
        <div className={classes.thumb}>
          <Icon size={2} name={direction === "column" ? "vertical-resize" : "horizontal-resize"} />
        </div>
      )}
    </div>
  );
};

export default Sash;
