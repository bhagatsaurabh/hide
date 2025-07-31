import { useContext, useEffect, useRef, useState } from "react";
import classes from "./TabGroup.module.css";
import { rand, uuidv4 as uuid } from "lib0/random.js";
import Icon from "@/components/common/Icon/Icon";
import { FNode } from "@/reducers/explorer";
import classNames from "classnames";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import { getFileIcon } from "@/utils";

const TabGroup = () => {
  const [tabs, setTabs] = useState<FNode[]>([]);
  const [active, setActive] = useState<FNode | null>(null);
  const { showTooltip, hideTooltip } = useContext(TooltipContext)!;
  const headingEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headingEl.current;
    const scrollHandler = (e: WheelEvent) => {
      el?.scrollBy(e.deltaY, 0);
    };

    el?.addEventListener("wheel", scrollHandler);

    return () => {
      el?.removeEventListener("wheel", scrollHandler);
    };
  }, []);

  const handleTabAdd = (fnode: FNode) => {
    setTabs((prev) => {
      const updated = [...prev];
      updated.push(fnode);
      return updated;
    });
  };
  const handleTabRemove = (fnode: FNode) => {
    if (!tabs.find((fn) => fn.id === fnode.id)) return;

    setTabs((prev) => {
      const updated = [...prev];
      updated.splice(
        updated.findIndex((fn) => fn.id === fnode.id),
        1
      );
      return [...updated];
    });
  };

  return (
    <div className={classes.tabgroup}>
      <div ref={headingEl} className={[classes.heading, "scrollable"].join(" ")}>
        {tabs.map((fnode) => (
          <div
            key={fnode.id}
            className={classNames({
              [classes.tabhead]: true,
              [classes.active]: fnode.id === active?.id,
            })}
            onMouseEnter={(e) => showTooltip(fnode.path, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            onClick={() => setActive(fnode)}
          >
            <Icon name={getFileIcon(fnode.name)} fs />
            <span className={classes.name}>{fnode.name}</span>
            <button
              onMouseEnter={(e) => showTooltip("Close", e.clientX, e.clientY)}
              onMouseLeave={hideTooltip}
              onClick={() => handleTabRemove(fnode)}
            >
              <Icon name="close" strokeWidth={0.4} size={0.6} />
            </button>
          </div>
        ))}
      </div>
      <div className={classes.content}>
        <button
          onClick={() =>
            handleTabAdd({ id: rand(), isOpen: false, name: uuid() + ".js", path: uuid() + ".js", type: "file" })
          }
        >
          Add
        </button>
        <br />
        {active?.name ?? "Nothing"}
      </div>
    </div>
  );
};

export default TabGroup;
