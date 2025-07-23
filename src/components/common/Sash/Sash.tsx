import { CSSProperties, useRef } from "react";
import classes from "./Sash.module.css";

interface SashProps {
  direction: "row" | "column";
  onDrag: (start: number, current: number) => void;
  onDragStart: () => void;
  active: boolean;
  style?: CSSProperties;
}

const Sash = ({ direction, onDrag, onDragStart, active, style = {} }: SashProps) => {
  const dragging = useRef(false);
  const lastPos = useRef(0);
  const startPos = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!active) return;
    dragging.current = true;
    startPos.current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = startPos.current;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    onDragStart();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const current = direction === "row" ? e.clientX : e.clientY;
    lastPos.current = current;
    onDrag(startPos.current, current);
  };

  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      style={style}
      className={[classes.sash, classes[direction], active ? classes.active : ""].join(" ")}
      onMouseDown={onMouseDown}
    />
  );
};

export default Sash;
