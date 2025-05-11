import { useCallback, useEffect, useMemo, useReducer } from "react";
import { FileNode as FNode, fileTreeReducer } from "@/reducers/explorer";
import { applyUpdate, Doc } from "yjs";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { FileNode } from "../FileNode/FileNode";
import { closeDir, closeFile, openDir, openFile } from "@/services/env";
import { FSBlock, FSEventBatch, FSPayload, FSResume, FSSync } from "@/models/filesystem";
import { socket } from "@/config/socket";
import { EnvContext } from "@/pages/Environment/context";
import { SocketMessage } from "@/models/common";
import { WebsocketProvider } from "@/lib/y-websocket";

interface ExplorerProps {
  uuid: string;
}

export const Explorer = ({ uuid }: ExplorerProps) => {
  const root: FNode = useMemo(
    () => ({
      id: 0,
      name: "",
      path: "/",
      type: "dir",
      children: [],
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
      const res = await openDir(uuid, "/");
      const nodes = res.data as unknown as FNode[];
      fsDispatch({ type: "LOAD", payload: { path: "/", nodes } });
    } catch (error) {
      console.log(error);
    }
  }, [uuid]);
  const handleFSMessage = (msg: SocketMessage<FSPayload>) => {
    switch (msg.data.action) {
      case "batch": {
        fsDispatch({ type: "BATCH", payload: { events: (msg.data as FSEventBatch).events } });
        break;
      }
      case "block": {
        fsDispatch({ type: "BLOCK", payload: { path: (msg.data as FSBlock).path } });
        break;
      }
      case "resume": {
        fsDispatch({ type: "RESUME", payload: { path: (msg.data as FSResume).path } });
        break;
      }
      default:
        break;
    }
  };
  const setListeners = () => {
    socket.on("fs", handleFSMessage);
  };

  useEffect(() => {
    init();
    setListeners();

    return () => {
      socket.off("fs", handleFSMessage);
      socket.emit("fs", { action: "close", payload: { path: "/" } });
    };
  }, [init]);
  useEffect(() => void handleStalePaths(), [fs.stalePaths]);

  const handleStalePaths = async () => {
    // Unwatch all stale paths
    await Promise.all(fs.stalePaths.map((pathPair) => closeDir(uuid, pathPair[0])));
    // Watch all new "moved" paths
    const newPaths = fs.stalePaths.filter((pathPair) => !!pathPair[1]).map((pathPair) => pathPair[1]!);
    const resps = await Promise.all(newPaths.map((newPath) => openDir(uuid, newPath)));
    newPaths.forEach((newPath, idx) => {
      if (resps?.[idx]?.data) {
        fsDispatch({
          type: "LOAD",
          payload: { path: newPath, nodes: resps[idx].data as unknown as FNode[], forceOpen: true },
        });
      }
    });
    fsDispatch({ type: "CLEAR_STALE", payload: null });
  };

  const open = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        const res = await openDir(uuid, path);
        const nodes = res.data as unknown as FNode[];
        fsDispatch({ type: "LOAD", payload: { path, nodes } });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const res = await openFile(uuid, path);
        const content = Uint8Array.from(atob(res.data), (c) => c.charCodeAt(0));
        const codeEditor = editor.create(document.getElementById("editor")!, {
          value: "",
          language: "javascript",
        });
        const doc = new Doc();
        const yText = doc.getText("monaco");
        applyUpdate(doc, content, "init");
        codeEditor.setValue(yText.toString());
        const model = codeEditor.getModel()!;
        const provider = new WebsocketProvider(socket, doc, path);
        const binding = new MonacoBinding(yText, model, new Set([codeEditor]), provider.awareness);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const close = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        await closeDir(uuid, path);
        fsDispatch({ type: "UNLOAD", payload: { path } });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await closeFile(uuid, path);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <EnvContext.Provider value={{ open, close }}>
        <div style={{ textAlign: "left" }}>
          {fs.root.children!.map((node, index) => (
            <FileNode key={index} node={node} />
          ))}
        </div>
      </EnvContext.Provider>
      <div id="editor" style={{ height: "40vh" }}></div>
    </>
  );
};
