import { MouseEvent, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { FNode, FNodeOf, fileTreeReducer } from "@/reducers/explorer";
import { Doc } from "yjs";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { socket } from "@/config/socket";
import { EnvContext } from "@/context/env/env.context";
import { WebsocketProvider } from "@/lib/y-websocket";
import { InSocketMessage } from "@/models/common";
import classes from "./Explorer.module.css";
import { closePath, openPath } from "@/services/env";
import { FSDirEntries, FSFile } from "@/models/filesystem";
import { noop } from "@/utils";
import { ViewContext } from "@/context/view/view.context";
import Spinner from "@/components/common/Spinner/Spinner";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import Icon from "@/components/common/Icon/Icon";
import FileList from "@/components/FileList/FileList";

const Explorer = () => {
  const { workspace } = useContext(ViewContext)!;
  const { showTooltip, hideTooltip } = useContext(TooltipContext)!;
  const [busy, setBusy] = useState(false);
  const root: FNodeOf<"dir"> = useMemo(
    () => ({
      id: 0,
      name: "",
      path: "/",
      type: "dir",
      children: [],
      isOpen: true,
    }),
    []
  );
  const [fs, fsDispatch] = useReducer(fileTreeReducer, {
    root,
    pathMap: new Map<string, FNode>([["/", root]]),
    stalePaths: [],
  });

  const init = useCallback(async () => {
    try {
      const { entries } = await openPath<FSDirEntries>(workspace.uuid, "/");
      const nodes: FNode[] = entries.map(
        (entry) =>
          ({
            id: entry.id,
            name: entry.name,
            path: entry.path,
            type: entry.isDir ? "dir" : "file",
            isOpen: false,
          } as FNode)
      );
      fsDispatch({ type: "LOAD", payload: { path: "/", nodes } });
    } catch (error) {
      console.log(error);
    }
  }, [workspace.uuid]);
  const handleFSMessage = (msg: InSocketMessage<"fs">) => {
    console.log(msg);
    switch (msg.action) {
      case "batch": {
        fsDispatch({ type: "BATCH", payload: { events: msg.payload.events } });
        break;
      }
      case "block": {
        fsDispatch({ type: "BLOCK", payload: { path: msg.payload.path } });
        break;
      }
      case "resume": {
        fsDispatch({ type: "RESUME", payload: { path: msg.payload.path } });
        break;
      }
      case "sync": {
        // TODO
        break;
      }
      case "lost": {
        // TODO
        break;
      }
      default:
        break;
    }
  };
  const handleStalePaths = useCallback(async () => {
    // Unwatch all stale paths
    await Promise.all(fs.stalePaths.map((pathPair) => closePath(workspace.uuid, pathPair[0])));
    // Watch all new "moved" paths
    const newPaths = fs.stalePaths.filter((pathPair) => !!pathPair[1]).map((pathPair) => pathPair[1]!);
    const resps = await Promise.all(newPaths.map((newPath) => openPath(workspace.uuid, newPath)));
    newPaths.forEach((newPath, idx) => {
      if (resps?.[idx]?.data) {
        fsDispatch({
          type: "LOAD",
          payload: { path: newPath, nodes: resps[idx].data as unknown as FNode[], forceOpen: true },
        });
      }
    });
    fsDispatch({ type: "CLEAR_STALE", payload: null });
  }, [fs.stalePaths, workspace.uuid]);

  useEffect(() => {
    init();
    socket?.on("fs", handleFSMessage);

    return () => {
      socket?.off("fs", handleFSMessage);
      closePath(workspace.uuid, "/");
    };
  }, [init, workspace.uuid]);
  useEffect(() => void handleStalePaths(), [fs.stalePaths, handleStalePaths]);

  const open = async (fnode: FNode) => {
    if (fnode.type === "dir") {
      try {
        const { entries } = await openPath<FSDirEntries>(workspace.uuid, fnode.path.substring(23));
        const nodes = entries.map(
          (entry) =>
            ({
              id: entry.id,
              name: entry.name,
              path: entry.path,
              type: entry.isDir ? "dir" : "file",
              isOpen: false,
            } as FNode)
        );
        fsDispatch({ type: "LOAD", payload: { path: fnode.path, nodes } });
        return true;
      } catch (error) {
        console.log(error);
      }
      return false;
    } else {
      const node = fs.pathMap.get(fnode.path);
      if (!node || node.isOpen) return true;

      try {
        const { content } = await openPath<FSFile>(workspace.uuid, fnode.path);
        const codeEditor = editor.create(document.getElementById("editor")!, {
          value: "",
          language: "javascript",
        });
        const model = codeEditor.getModel()!;
        const doc = new Doc();
        const yText = doc.getText("monaco");
        const provider = new WebsocketProvider(workspace.uuid, socket, doc, fnode.path);
        const binding = new MonacoBinding(yText, model, new Set([codeEditor]), provider.awareness);
        fsDispatch({ type: "OPEN_FILE", payload: { path: fnode.path, provider, binding, editor: codeEditor, doc } });
        return true;
      } catch (error) {
        console.log(error);
      }
      return false;
    }
  };
  const close = async (fnode: FNode) => {
    if (fnode.type === "dir") {
      try {
        closePath(workspace.uuid, fnode.path);
        fsDispatch({ type: "UNLOAD", payload: { path: fnode.path } });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        closePath(workspace.uuid, fnode.path);
        fsDispatch({ type: "CLOSE_FILE", payload: { path: fnode.path } });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <EnvContext.Provider value={{ open, close, save: noop }}>
      <div className={classes.explorer}>
        <div className={classes.heading}>EXPLORER</div>
        <div className={classes.content}>
          <div className={classes.title}>
            <div className={classes.titleleft}>
              <Spinner className={busy ? "visible" : "hidden"} size={1} />
              <span>WORKSPACE</span>
            </div>
            <div className={classes.titleright}>
              <button
                onMouseEnter={(e: MouseEvent) => showTooltip("New File", e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
                className="p-0p1"
              >
                <Icon name="new-file" />
              </button>
              <button
                onMouseEnter={(e: MouseEvent) => showTooltip("New Folder", e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
                className="p-0p1"
              >
                <Icon name="new-folder" />
              </button>
              <button
                onMouseEnter={(e: MouseEvent) => showTooltip("Refresh", e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
                className="p-0p1"
              >
                <Icon name="refresh" />
              </button>
              <button
                onMouseEnter={(e: MouseEvent) => showTooltip("Collapse All", e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
                className="p-0p1"
              >
                <Icon name="collapse-all" />
              </button>
            </div>
          </div>
          <div className={classes.fs}>
            {fs.root.children.length === 0 ? (
              <div className={classes.empty}>Empty workspace</div>
            ) : (
              <FileList root={fs.root} open={open} close={close} />
            )}
          </div>
        </div>
      </div>
    </EnvContext.Provider>
  );
};

export default Explorer;
