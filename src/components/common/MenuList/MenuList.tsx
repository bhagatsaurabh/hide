import bus from "@/config/bus";
import { CommandMap, MenuItem } from "@/models/context-menu";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classes from "./MenuList.module.css";
import classNames from "classnames";
import Icon from "../Icon/Icon";

const ITEM_HEIGHT = 26;

interface MenuListProps {
  items: MenuItem[];
  depth: number;
  path: number[];
  openPath: number[];
  setOpenPath: (p: number[]) => void;
  activeIndexPath: number[];
  setActiveIndexPath: (p: number[]) => void;
  context?: unknown;
  onMouseEnterMenu: () => void;
  onMouseLeaveMenu: (depth: number) => void;
}

const MenuList = ({
  items,
  depth,
  path,
  openPath,
  setOpenPath,
  activeIndexPath,
  setActiveIndexPath,
  context,
  onMouseEnterMenu,
  onMouseLeaveMenu,
}: MenuListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const subMenuHandle = useRef(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [submenuPositions, setSubmenuPositions] = useState<Record<number, { left: number; top: number }>>({});

  useEffect(() => {
    return () => clearTimeout(subMenuHandle.current);
  }, []);
  useLayoutEffect(() => {
    const openIndex = openPath[depth];
    if (openIndex === undefined) return;

    const item = items[openIndex];
    if (item.type !== "submenu") return;

    if (!item || !item.items || item.items.length === 0) return;

    const el = itemRefs.current[openIndex];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.right + 2;
    let top = rect.top;

    const estWidth = 200;
    const estHeight = item.items.length * ITEM_HEIGHT;

    if (left + estWidth > vw) {
      left = rect.left - estWidth - 2;
    }
    if (top + estHeight > vh) {
      top = Math.max(8, vh - estHeight - 8);
    }

    setSubmenuPositions((prev) => ({
      ...prev,
      [openIndex]: { left, top },
    }));
  }, [openPath, items, depth]);
  useEffect(() => {
    const activeIndex = activeIndexPath[depth];
    if (activeIndex != null && listRef.current) {
      const child = listRef.current.children[activeIndex] as HTMLElement | undefined;
      child?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndexPath, depth]);

  const handleMouseEnter = (item: MenuItem, path: number[], idx: number) => {
    clearTimeout(subMenuHandle.current);
    setActiveIndexPath([...path, idx]);
    if (item.type === "submenu") {
      subMenuHandle.current = setTimeout(() => {
        setOpenPath([...path, idx]);
      }, 350);
    } else {
      setOpenPath(path);
    }
  };
  const handleCommandEmit = (command: keyof CommandMap) => {
    if (command === "file.new" || command === "folder.new") {
      bus.emit(command, { path: "" });
    }
  };

  return (
    <div
      className={classes.list}
      onMouseEnter={() => onMouseEnterMenu()}
      onMouseLeave={() => onMouseLeaveMenu(depth)}
    >
      {items.map((item, idx) => {
        if (item.type === "separator") {
          return <div className={classes.separator} key={`sep-${idx}`} />;
        }

        const isOpen = openPath[depth] === idx;
        const isActive = activeIndexPath[depth] === idx;

        return (
          <Fragment key={item.label ?? `item-${idx}`}>
            <div
              ref={(el) => void (itemRefs.current[idx] = el)}
              className={classNames({
                [classes.item]: true,
                [classes.active]: isActive && item.type === "submenu",
                [classes.disabled]: item.disabled,
              })}
              onMouseEnter={() => handleMouseEnter(item, path, idx)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                if (!item.disabled && item.type !== "submenu") {
                  handleCommandEmit(item.command);
                  bus.emit("internal.context.close");
                  setOpenPath([]);
                  setActiveIndexPath([]);
                }
              }}
            >
              <span>{item.label}</span>
              {item.type === "submenu" && <Icon name="chevron-right" color="#454545" size={0.7} />}
            </div>

            {isOpen &&
              item.type === "submenu" &&
              submenuPositions[idx] &&
              createPortal(
                <div
                  style={{
                    position: "fixed",
                    top: submenuPositions[idx].top,
                    left: submenuPositions[idx].left,
                    zIndex: 100,
                  }}
                >
                  <MenuList
                    onMouseEnterMenu={onMouseEnterMenu}
                    onMouseLeaveMenu={onMouseLeaveMenu}
                    items={item.items}
                    depth={depth + 1}
                    path={[...path, idx]}
                    openPath={openPath}
                    setOpenPath={setOpenPath}
                    activeIndexPath={activeIndexPath}
                    setActiveIndexPath={setActiveIndexPath}
                    context={context}
                  />
                </div>,
                document.body
              )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default MenuList;
