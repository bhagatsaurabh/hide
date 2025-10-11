import { useEffect, useRef, useState } from "react";
import MenuList from "../MenuList/MenuList";
import bus from "@/config/bus";
import { CommandMap, MenuItem } from "@/models/context-menu";
import classes from "./ContextMenu.module.css";
import classNames from "classnames";

const ITEM_HEIGHT = 26;
const MENU_PADDING = 4;

const ContextMenu = () => {
  const anchorEl = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  const [openPath, setOpenPath] = useState<number[]>([]);
  const [activeIndexPath, setActiveIndexPath] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const leaveHandle = useRef(-1);

  useEffect(() => {
    const handleContextOpen: CommandMap["internal.context.open"] = ({ items, anchor }) => {
      anchorEl.current = anchor;
      const { x, y } = anchorEl.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const widthEstimate = 220;
      const heightEstimate = Math.min(ITEM_HEIGHT * menuItems.length + MENU_PADDING * 2, 400);

      let left = x;
      let top = y;
      if (left + widthEstimate > vw) left = Math.max(8, vw - widthEstimate - 8);
      if (top + heightEstimate > vh) top = Math.max(8, vh - heightEstimate - 8);

      setMenuItems(items);
      setMenuPos({ left, top });
      setOpenPath([]);
      setActiveIndexPath([0]);
      setShow(true);
    };

    const handleGlobalMouseDown = () => setShow(false);
    const handleGlobalCtxMenu = () => setShow(false);
    const handleGlobalKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    window.addEventListener("mousedown", handleGlobalMouseDown);
    window.addEventListener("contextmenu", handleGlobalCtxMenu);
    window.addEventListener("keydown", handleGlobalKeyDown);

    const unsub1 = bus.on("internal.context.open", handleContextOpen);
    const unsub2 = bus.on("internal.context.close", () => setShow(false));
    return () => {
      unsub1();
      unsub2();
      window.removeEventListener("mousedown", () => handleGlobalMouseDown);
      window.removeEventListener("contextmenu", handleGlobalCtxMenu);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleMouseEnterMenu = () => {
    clearTimeout(leaveHandle.current);
  };
  const handleMouseLeaveMenu = (depth: number) => {
    leaveHandle.current = window.setTimeout(() => {
      setOpenPath((path) => path.slice(0, depth));
      setActiveIndexPath((path) => path.slice(0, depth));
    }, 350);
  };

  return (
    <div
      className={classNames({
        [classes.contextmenu]: true,
        [classes.show]: show,
      })}
    >
      <div
        ref={containerRef}
        className={classes.wrapper}
        style={{ left: menuPos.left, top: menuPos.top }}
        role="menu"
      >
        {show && (
          <MenuList
            onMouseEnterMenu={handleMouseEnterMenu}
            onMouseLeaveMenu={handleMouseLeaveMenu}
            items={menuItems}
            depth={0}
            path={[]}
            openPath={openPath}
            setOpenPath={setOpenPath}
            activeIndexPath={activeIndexPath}
            setActiveIndexPath={setActiveIndexPath}
          />
        )}
      </div>
    </div>
  );
};

export default ContextMenu;
