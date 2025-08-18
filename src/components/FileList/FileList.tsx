import { MouseEvent, Ref, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
  blocked?: boolean;
};
export type FileListRef = {
  refresh: () => void;
};

interface FileListProps {
  root: FNodeOf<"dir">;
  open: (fnode: FNode) => Promise<boolean>;
  close: (fnode: FNode) => void;
  draft: (fnode: FNode) => void;
  save: (fnode: FNode, commit: boolean) => Promise<void>;
  isDraft: boolean;
  ref: Ref<FileListRef>;
}

const FileList = ({ root, open, close, draft, save, isDraft, ref }: FileListProps) => {
  const expandedDirs = useRef<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const selected = useRef<FNode | null>(null);
  const { hideTooltip, showTooltip } = useContext(TooltipContext)!;
  const draftInputEl = useRef<HTMLInputElement>(null);
  const [draftInput, setDraftInput] = useState("");

  useEffect(() => {
    const handleNew = (type: "file" | "dir") => {
      let parent: FNodeOf<"dir">;
      if (!selected.current) {
        parent = root;
      } else if (selected.current.type === "file") {
        parent = selected.current.parent;
      } else {
        parent = selected.current;
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
    if (isDraft && draftInputEl.current) {
      draftInputEl.current.focus();
    }
    if (!isDraft) {
      setDraftInput("");
    }
  }, [isDraft, draftInputEl]);
  const flatNodes = useMemo(() => {
    const result: FlatNode[] = [];
    if (!root || !root.children) return result;

    const walk = (node: FNode, depth: number, blocked = false, skip = false) => {
      if (!skip) {
        result.push({ fnode: node, depth, blocked });
      }

      if (node.type === "dir" && (expandedDirs.current.has(node.path) || skip) && node.children) {
        const sortedChildren = [...node.children].sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "dir" ? -1 : 1;
        });
        for (const child of sortedChildren) {
          walk(child, depth + 1, blocked || child.isBlocked);
        }
      }
    };

    walk(root, 0, !!root.isBlocked, true);
    return result;
  }, [root]);
  useEffect(() => {
    const handleCollapseAll = () => {
      flatNodes
        .filter((node) => node.fnode.type === "dir" && node.fnode.isOpen)
        .forEach((node) => {
          handleClick(node.fnode);
        });
    };
    const handleCollapse = (path: string) => {
      const nodeToCollapse = flatNodes.find((node) => node.fnode.path === path);
      if (nodeToCollapse && nodeToCollapse.fnode.isOpen) {
        handleClick(nodeToCollapse.fnode);
      }
    };

    const unsubs: Unsubscribe[] = [];
    unsubs.push(bus.on("internal.explorer.collapseall", () => handleCollapseAll()));
    unsubs.push(bus.on("internal.explorer.collapse", ({ path }) => handleCollapse(path)));
    return () => unsubs.forEach((unsub) => unsub());
  }, [flatNodes]);
  useImperativeHandle(ref, () => ({
    refresh,
  }));

  const refresh = () => {
    expandedDirs.current = new Set();
  };

  const handleDraftBlur = async (draftNode: FNode) => {
    setBusy((prev) => new Set([...prev, draftNode.id]));

    const node = { ...draftNode };
    node.name = draftInput;
    node.path = draftNode.path + draftInput;
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
    selected.current = fnode;
    let success = false;
    if (fnode.isOpen) {
      close(fnode);
      success = true;
    } else {
      success = await open(fnode);
    }
    if (success) {
      if (fnode.type === "dir") {
        const newSet = new Set([...expandedDirs.current]);
        if (newSet.has(fnode.path)) {
          expandedDirs.current.forEach((path) => {
            if (path.startsWith(fnode.path)) {
              newSet.delete(path);
            }
          });
        } else {
          newSet.add(fnode.path);
        }
        expandedDirs.current = newSet;
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
      {flatNodes.map(({ fnode, depth, blocked }) => (
        <div
          key={fnode.id}
          className={classNames({
            [classes.fsitem]: true,
            [classes.selected]: fnode.id === selected.current?.id,
            [classes.disabled]: busy.has(fnode.id) || blocked || fnode.isBlocked,
          })}
          style={{ paddingLeft: `${depth * 0.5}rem` }}
          onClick={() => handleClick(fnode)}
          onMouseEnter={(e: MouseEvent) => showTooltip(fnode.path.substring(10), e.clientX, e.clientY)}
          onMouseLeave={hideTooltip}
        >
          {busy.has(fnode.id) || fnode.isBlocked ? (
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
              style={{ transform: `rotateZ(${expandedDirs.current.has(fnode.path) ? 90 : 0}deg)` }}
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
