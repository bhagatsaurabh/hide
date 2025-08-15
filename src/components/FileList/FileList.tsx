import { MouseEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import classes from "./FileList.module.css";
import Spinner from "../common/Spinner/Spinner";
import Icon from "../common/Icon/Icon";
import { getFileIcon } from "@/utils";
import classNames from "classnames";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import { FNode, FNodeOf } from "@/models/filesystem";
import bus from "@/config/bus";
import { Unsubscribe } from "nanoevents";
import { uint32 } from "lib0/random.js";

type FlatNode = {
  fnode: FNode;
  depth: number;
};

interface FileListProps {
  root: FNodeOf<"dir">;
  open: (fnode: FNode) => Promise<boolean>;
  close: (fnode: FNode) => void;
  draft: (fnode: FNode) => void;
  save: (fnode: FNode, commit: boolean) => Promise<void>;
  isDraft: boolean;
}

const FileList = ({ root, open, close, draft, save, isDraft }: FileListProps) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<FNode | null>(null);
  const { hideTooltip, showTooltip } = useContext(TooltipContext)!;
  const draftInputEl = useRef<HTMLInputElement>(null);
  const [draftInput, setDraftInput] = useState("");

  useEffect(() => {
    const handleNew = (type: "file" | "dir") => {
      let parent: FNodeOf<"dir">;
      if (!selected) parent = root;
      else if (selected.type === "file") {
        parent = selected.parent;
      } else {
        parent = selected;
      }
      let draftNode: FNodeOf<"file"> | FNodeOf<"dir">;
      if (type === "file") {
        draftNode = {
          id: -uint32(),
          isOpen: false,
          name: "",
          path: parent.path === "/" ? `/workspace/` : parent.path + "/",
          type,
          parent,
          isDraft: true,
        };
      } else {
        draftNode = {
          id: -uint32(),
          isOpen: false,
          name: "",
          path: parent.path === "/" ? `/workspace/` : parent.path + "/",
          type,
          parent,
          isDraft: true,
          children: [],
        };
      }
      draft(draftNode);
    };

    const unsubs: Unsubscribe[] = [];
    unsubs.push(bus.on("file.new", () => handleNew("file")));
    unsubs.push(bus.on("folder.new", () => handleNew("dir")));
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  useEffect(() => {
    if (isDraft) {
      if (!draftInputEl.current) {
        // TODO
      } else {
        draftInputEl.current.focus();
      }
    }
  }, [isDraft, draftInputEl.current]);

  const flatNodes = useMemo(() => {
    const result: FlatNode[] = [];
    if (!root || !root.children) return result;

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

  const handleDraftBlur = async (draftNode: FNode) => {
    setBusy((prev) => new Set([...prev, draftNode.id]));

    const node = { ...draftNode };
    node.name = draftInput;
    node.path = draftNode.path + draftInput;
    console.log({ ...node });
    await save(node, !!draftInput);

    setBusy((prev) => {
      const updated = new Set([...prev]);
      updated.delete(draftNode.id);
      return updated;
    });
  };
  const handleClick = async (fnode: FNode) => {
    if (busy.has(fnode.id) || fnode.isDraft) return;
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
          onMouseEnter={(e: MouseEvent) => showTooltip(fnode.path.substring(10), e.clientX, e.clientY)}
          onMouseLeave={hideTooltip}
        >
          {busy.has(fnode.id) ? (
            <Spinner size={0.8} className="ml-0p5 flex-shrink-0" />
          ) : fnode.type === "file" ? (
            <Icon
              className="ml-0p5 flex-shrink-0"
              name={getFileIcon(fnode.isDraft ? draftInput : fnode.name)}
              size={0.8}
              fs
            />
          ) : (
            <Icon
              className="ml-0p5 flex-shrink-0"
              color="#505050"
              strokeWidth={1.5}
              size={0.8}
              style={{ transform: `rotateZ(${expandedDirs.has(fnode.path) ? 90 : 0}deg)` }}
              name="chevron-right"
            />
          )}
          {fnode.isDraft && (
            <input
              ref={draftInputEl}
              className={classes.draftinput}
              type="text"
              spellCheck={false}
              placeholder={`${fnode.type === "file" ? "File" : "Directory"} name`}
              value={draftInput}
              onInput={(e) => setDraftInput((e.target as HTMLInputElement).value)}
              onBlur={() => handleDraftBlur(fnode)}
            />
          )}
          {fnode.isDraft ? (
            <span className={[classes.name, classes.draft].join(" ")}>&nbsp;</span>
          ) : (
            <span className={classes.name}>{fnode.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileList;
