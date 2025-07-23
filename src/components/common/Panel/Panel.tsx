import { CSSProperties, Fragment, useContext, useRef, useState } from "react";
import { ViewContext } from "@/context/view/view.context";
import { OutPortal } from "react-reverse-portal";
import classes from "./Panel.module.css";
import Sash from "../Sash/Sash";
import { parseSizetoPx } from "@/utils";

export type PanelSchema = {
  id?: string;
  type: "panel" | "view";
  size: string | number;
  minSize?: string;
  direction?: "row" | "column";
  children?: PanelSchema[];
  viewId?: string;
  resizable?: boolean;
  collapsible?: boolean;
};

interface PanelProps {
  schema: PanelSchema;
  className?: string;
  dimension: { width: number; height: number };
  position: { top?: number; left?: number };
  style?: CSSProperties;
}

type Position = { left: number; top: number };
type Rect = { pos: Position; size: number };

export const Panel = ({ className = "", schema, dimension, position, style = {} }: PanelProps) => {
  const { getNode } = useContext(ViewContext)!;
  const direction = schema.direction ?? "row";
  const children = schema.children ?? [];

  let totalSize = direction === "row" ? dimension.width : dimension.height;
  const childSizes = new Array<number>(children.length);
  const childMinSizes = new Array<number>(children.length).fill(48);
  let lastIdx: number;
  children.forEach((node, idx) => {
    if (typeof node.size === "string") {
      const size = parseSizetoPx(node.size);
      childSizes[idx] = size;
      totalSize -= size;
    } else {
      lastIdx = idx;
    }
    if (node.minSize) {
      childMinSizes[idx] = parseSizetoPx(node.minSize);
    }
  });
  children.forEach((node, idx) => {
    if (typeof node.size === "number") {
      let size;
      if (idx === lastIdx) {
        size = totalSize;
      } else {
        size = totalSize * node.size;
      }
      childSizes[idx] = size;
      totalSize -= size;
    }
  });
  const childPos = new Array<Position>(children.length).fill({} as Position).map(() => ({ left: 0, top: 0 }));
  let pos = 0;
  const prop = direction === "row" ? "left" : "top";
  children.forEach((_, idx) => {
    childPos[idx][prop] = pos;
    pos += childSizes[idx];
  });

  const [rects, setRects] = useState<Rect[]>(childPos.map((pos, idx) => ({ pos, size: childSizes[idx] })));

  const initialSizes = useRef([0, 0]);
  const handleResizeStart = (idx: number) => {
    initialSizes.current = [rects[idx].size, rects[idx + 1].size];
  };
  const handleResize = (start: number, current: number, idx: number) => {
    setRects((prevRects) => {
      const nextRects = [...prevRects];
      const deltan = current - start;
      const posA = nextRects[idx].pos[prop];
      const prevSizeA = initialSizes.current[0];
      const prevSizeB = initialSizes.current[1];
      const total = prevSizeA + prevSizeB;
      const minSizeA = childMinSizes[idx];
      const minSizeB = childMinSizes[idx + 1];
      let newSizeA = prevSizeA + deltan;
      let newSizeB = prevSizeB - deltan;

      if (newSizeA < minSizeA) {
        newSizeA = minSizeA;
        newSizeB = total - newSizeA;
      } else if (newSizeB < minSizeB) {
        newSizeB = minSizeB;
        newSizeA = total - newSizeB;
      }

      nextRects[idx].size = newSizeA;
      nextRects[idx + 1].size = newSizeB;

      nextRects[idx + 1].pos[prop] = posA + newSizeA;

      return nextRects;
    });
  };

  const posStyle: CSSProperties = {};
  if (typeof position.left === "number") posStyle.left = `${position.left}px`;
  if (typeof position.top === "number") posStyle.top = `${position.top}px`;

  return (
    <div className={[classes.panel, className].join(" ")} style={{ ...style, ...posStyle }}>
      {children.map((node, idx) => (
        <Fragment key={idx}>
          {node.viewId ? (
            <div
              className={[classes.panel, className].join(" ")}
              style={{
                width: direction === "row" ? `${rects[idx].size}px` : "100%",
                height: direction === "row" ? "100%" : `${rects[idx].size}px`,
                top: `${rects[idx].pos.top}px`,
                left: `${rects[idx].pos.left}px`,
              }}
            >
              <OutPortal node={getNode(node.viewId)} />
            </div>
          ) : (
            <Panel
              style={{
                width: direction === "row" ? `${rects[idx].size}px` : "100%",
                height: direction === "row" ? "100%" : `${rects[idx].size}px`,
              }}
              dimension={{
                width: direction === "row" ? rects[idx].size : dimension.width,
                height: direction === "row" ? dimension.height : rects[idx].size,
              }}
              position={rects[idx].pos}
              schema={node}
            />
          )}
          {idx < children.length - 1 && node.resizable && (
            <Sash
              style={{
                left: direction === "row" ? rects[idx].pos.left + rects[idx].size - 2 : 0,
                top: direction === "row" ? 0 : rects[idx].pos.top + rects[idx].size - 2,
              }}
              direction={direction}
              active={!!node.resizable}
              onDrag={(start, current) => node.resizable && handleResize(start, current, idx)}
              onDragStart={() => handleResizeStart(idx)}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};
