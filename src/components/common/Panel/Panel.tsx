import { CSSProperties, Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ViewContext } from "@/context/view/view.context";
import { OutPortal } from "react-reverse-portal";
import classes from "./Panel.module.css";
import Sash from "../Sash/Sash";
import { parseSizetoPx } from "@/utils";
import Icon from "../Icon/Icon";
import classNames from "classnames";
import bus from "@/config/bus";

export type PanelSchema = {
  id: string;
  type: "panel" | "view";
  size: string | number;
  minSize?: string;
  direction?: "row" | "column";
  children?: PanelSchema[];
  viewId?: string;
  resizable?: boolean;
  collapsible?: boolean;
  title?: string;
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
  const children = useMemo(() => schema.children ?? [], [schema.children]);
  const prop = direction === "row" ? "left" : "top";

  const childMinSizes = useMemo(() => {
    const childMinSizes = new Array<number>(children.length).fill(48);
    children.forEach((node, idx) => {
      if (node.minSize) {
        childMinSizes[idx] = parseSizetoPx(node.minSize);
      }
    });
    return childMinSizes;
  }, [children]);
  const childSizes = useMemo(() => {
    let totalSize = direction === "row" ? dimension.width : dimension.height;
    const childSizes = new Array<number>(children.length);

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
    return childSizes;
  }, [childMinSizes, children, dimension.height, dimension.width, direction]);
  const childPos = useMemo(() => {
    const childPos = new Array<Position>(children.length).fill({} as Position).map(() => ({ left: 0, top: 0 }));
    let pos = 0;
    children.forEach((_, idx) => {
      childPos[idx][prop] = pos;
      pos += childSizes[idx];
    });
    return childPos;
  }, [childSizes, children, prop]);

  // const [rects, setRects] = useState<Rect[]>(childPos.map((pos, idx) => ({ pos, size: childSizes[idx] })));
  const [rects, setRects] = useState<Rect[]>([]);

  useEffect(() => {
    setRects(childPos.map((pos, idx) => ({ pos, size: childSizes[idx] })));
  }, [childPos, childSizes]);
  const collapsibles = useRef<Map<string, { collapsed: boolean; oldSize: number }>>(new Map());

  useEffect(() => {
    children.forEach((child, idx) => {
      if (child.collapsible && rects[idx]) {
        collapsibles.current.set(child.id, { collapsed: false, oldSize: rects[idx].size });
      }
    });
  }, [schema]);

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
  const handleCollapse = (idx: number, node: PanelSchema) => {
    const collapsible = collapsibles.current.get(node.id);
    if (!collapsible) return;

    const anchorIdx = getNearestFlexNode(idx);
    if (anchorIdx === -1) return;

    collapsible.collapsed = !collapsible.collapsed;
    const updatedRects = [...rects];
    if (collapsible.collapsed) {
      collapsible.oldSize = rects[idx].size;

      const delta = rects[idx].size - 36;
      updatedRects[anchorIdx].size += delta;
      updatedRects[idx].size -= delta;
      if (schema.direction === "row") {
        updatedRects[idx].pos.left += delta;
      } else {
        updatedRects[idx].pos.top += delta;
      }
    } else {
      const delta = collapsible.oldSize - 36;
      updatedRects[anchorIdx].size -= delta;
      updatedRects[idx].size += delta;
      if (schema.direction === "row") {
        updatedRects[idx].pos.left -= delta;
      } else {
        updatedRects[idx].pos.top -= delta;
      }
    }
    setRects(updatedRects);
  };
  const getNearestFlexNode = (idx: number) => {
    idx -= 1;
    while (idx >= 0) {
      if (typeof children[idx].size === "number") return idx;
      idx -= 1;
    }
    return -1;
  };

  const getView = (idx: number, node: PanelSchema) => {
    const collapsibleStyle = {} as CSSProperties;
    if (node.collapsible) {
      collapsibleStyle.width = schema.direction === "row" ? "2.25rem" : "100%";
      collapsibleStyle.height = schema.direction === "row" ? "100%" : "2.25rem";
    }

    return (
      <div
        className={[classes.panel, className].join(" ")}
        style={{
          width: direction === "row" ? `${rects[idx].size}px` : "100%",
          height: direction === "row" ? "100%" : `${rects[idx].size}px`,
          top: `${rects[idx].pos.top}px`,
          left: `${rects[idx].pos.left}px`,
          flexDirection: schema.direction,
        }}
      >
        {node.collapsible && (
          <div className={classes.collapsible} style={collapsibleStyle} onClick={() => handleCollapse(idx, node)}>
            <Icon
              name="chevron-right"
              size={1}
              className={classNames({ "rotate-90": !collapsibles.current.get(node.id)?.collapsed })}
            />
            <h3 className={classes.title}>{node.title}</h3>
          </div>
        )}
        <OutPortal node={getNode(node.viewId!)} schema={node} />
      </div>
    );
  };
  const getPanel = (idx: number, node: PanelSchema) => {
    return (
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
    );
  };
  const getSash = (idx: number, node: PanelSchema) => {
    return (
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
    );
  };

  const posStyle: CSSProperties = {};
  if (typeof position.left === "number") posStyle.left = `${position.left}px`;
  if (typeof position.top === "number") posStyle.top = `${position.top}px`;

  return (
    <div className={[classes.panel, className].join(" ")} style={{ ...style, ...posStyle }}>
      {rects.length === children.length &&
        children.map((node, idx) => {
          return (
            <Fragment key={idx}>
              {node.viewId ? getView(idx, node) : getPanel(idx, node)}
              {idx < children.length - 1 && node.resizable ? getSash(idx, node) : null}
            </Fragment>
          );
        })}
    </div>
  );
};
