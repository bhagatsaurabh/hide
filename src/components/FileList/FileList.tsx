import { MouseEvent, useContext, useMemo, useState } from "react";
import classes from "./FileList.module.css";
import { FNode } from "@/reducers/explorer";
import Spinner from "../common/Spinner/Spinner";
import Icon from "../common/Icon/Icon";
import { getExt, getFileIcon } from "@/utils";
import classNames from "classnames";
import iconMapping from "@/assets/icon-map.json";
import { TooltipContext } from "@/context/tooltip/tooltip.context";

type FlatNode = {
  fnode: FNode;
  depth: number;
};
type IconMap = {
  fileNames: Record<string, string>;
  fileExtensions: Record<string, string>;
};

interface FileListProps {
  root: FNode;
  open: (fnode: FNode) => Promise<boolean>;
  close: (fnode: FNode) => void;
}

const iconMap = iconMapping as IconMap;

const FileList = ({ root, open, close }: FileListProps) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<FNode | null>(null);
  const { hideTooltip, showTooltip } = useContext(TooltipContext)!;

  const flatNodes = useMemo(() => {
    const result: FlatNode[] = [];

    const walk = (node: FNode, depth: number, skip = false) => {
      if (!skip) {
        result.push({ fnode: node, depth });
      }

      if (node.type === "dir" && (expandedDirs.has(node.path) || skip) && node.children) {
        const sortedChildren = [...node.children].sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "dir" ? -1 : 1;
        });
        for (const child of sortedChildren) {
          walk(child, depth + 1);
        }
      }
    };

    walk(root, 0, true);
    return result;
  }, [root, expandedDirs]);

  const handleClick = async (fnode: FNode) => {
    if (busy.has(fnode.id)) return;
    setBusy((prev) => new Set([...prev, fnode.id]));
    setSelected(fnode);
    let success = false;
    if (fnode.isOpen) {
      close(fnode);
      success = true;
    } else {
      success = await open(fnode);
    }
    if (success) {
      fnode.isOpen = !fnode.isOpen;
      if (fnode.type === "dir") {
        setExpandedDirs((prev) => {
          const next = new Set(prev);
          if (next.has(fnode.path)) next.delete(fnode.path);
          else next.add(fnode.path);
          return next;
        });
      }
    }
    setBusy((prev) => {
      const updated = new Set([...prev]);
      updated.delete(fnode.id);
      return updated;
    });
  };

  return (
    <div className={classes.fslist}>
      {flatNodes.map(({ fnode, depth }) => (
        <div
          key={fnode.id}
          className={classNames({
            [classes.fsitem]: true,
            [classes.selected]: fnode.id === selected?.id,
            [classes.disabled]: busy.has(fnode.id),
          })}
          style={{ paddingLeft: `${depth * 0.5}rem` }}
          onClick={() => handleClick(fnode)}
          onMouseEnter={(e: MouseEvent) => showTooltip(fnode.path.substring(23), e.clientX, e.clientY)}
          onMouseLeave={hideTooltip}
        >
          {fnode.type === "file" && <Icon className="ml-0p5 flex-shrink-0" name={getFileIcon(fnode.name)} size={0.8} fs />}
          {fnode.type === "dir" &&
            (busy.has(fnode.id) ? (
              <Spinner size={0.8} className="ml-0p5 flex-shrink-0" />
            ) : (
              <Icon
                className="ml-0p5 flex-shrink-0"
                color="#505050"
                strokeWidth={1.5}
                size={0.8}
                style={{ transform: `rotateZ(${expandedDirs.has(fnode.path) ? 90 : 0}deg)` }}
                name="chevron-right"
              />
            ))}
          <span className={classes.name}>{fnode.name}</span>
        </div>
      ))}
    </div>
  );
};

export default FileList;
