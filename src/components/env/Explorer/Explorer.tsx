import { useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { FNode, FNodeOf, fileTreeReducer } from "@/reducers/explorer";
import { Doc } from "yjs";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { FileNode } from "../../FileNode/FileNode";
import { socket } from "@/config/socket";
import { EnvContext } from "@/context/env/env.context";
import { WebsocketProvider } from "@/lib/y-websocket";
import { InSocketMessage } from "@/models/common";
import classes from "./Explorer.module.css";
import { closePath, openPath } from "@/services/env";
import { FSDirEntries, FSFile } from "@/models/filesystem";
import { noop } from "@/utils";
import { ViewContext } from "@/context/view/view.context";

const Explorer = () => {
  const { workspace } = useContext(ViewContext)!;
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
  useEffect(() => {
    handleStalePaths();
  }, [fs.stalePaths, handleStalePaths]);

  const open = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        const { entries } = await openPath<FSDirEntries>(workspace.uuid, path);
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
        fsDispatch({ type: "LOAD", payload: { path, nodes } });
      } catch (error) {
        console.log(error);
      }
    } else {
      const node = fs.pathMap.get(path);
      if (!node || node.isOpen) return;

      try {
        const { content } = await openPath<FSFile>(workspace.uuid, path);
        const codeEditor = editor.create(document.getElementById("editor")!, {
          value: "",
          language: "javascript",
        });
        const model = codeEditor.getModel()!;
        const doc = new Doc();
        const yText = doc.getText("monaco");
        const provider = new WebsocketProvider(workspace.uuid, socket, doc, path);
        const binding = new MonacoBinding(yText, model, new Set([codeEditor]), provider.awareness);
        fsDispatch({ type: "OPEN_FILE", payload: { path, provider, binding, editor: codeEditor, doc } });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const close = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        closePath(workspace.uuid, path);
        fsDispatch({ type: "UNLOAD", payload: { path } });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        closePath(workspace.uuid, path);
        fsDispatch({ type: "CLOSE_FILE", payload: { path } });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <EnvContext.Provider value={{ open, close, save: noop }}>
        <div style={{ textAlign: "left" }}>
          {fs.root.children!.map((node, index) => (
            <FileNode key={index} node={node} />
          ))}
        </div>
      </EnvContext.Provider>
    </>
  );
};

export default Explorer;
