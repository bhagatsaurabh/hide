import { CSSProperties, useRef, useState } from "react";
import classes from "./Sash.module.css";
import classNames from "classnames";

interface SashProps {
  direction: "row" | "column";
  onDrag: (start: number, current: number) => void;
  onDragStart: () => void;
  active: boolean;
  style?: CSSProperties;
}

const Sash = ({ direction, onDrag, onDragStart, active, style = {} }: SashProps) => {
  const [dragging, setDragging] = useState(false);
  const _dragging = useRef(false);
  const lastPos = useRef(0);
  const startPos = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!active) return;
    _dragging.current = true;
    setDragging(true);
    startPos.current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = startPos.current;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    onDragStart();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!_dragging.current) return;
    const current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = current;
    onDrag(startPos.current, current);
  };

  const onMouseUp = () => {
    _dragging.current = false;
    setDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  return (
    <div
      style={style}
      className={classNames({
        [classes.sash]: true,
        [classes[direction]]: true,
        [classes.active]: active,
        [classes.dragging]: dragging,
      })}
      onMouseDown={onMouseDown}
    />
  );
};

export default Sash;
