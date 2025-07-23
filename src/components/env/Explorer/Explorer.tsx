import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
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

interface ExplorerProps {
  uuid: string;
}

const Explorer = (/* { uuid }: ExplorerProps */) => {
  /* const root: FNodeOf<"dir"> = useMemo(
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
      // const res = await openDir(uuid, "/");
      // const nodes = res.data as unknown as FNode[];
      // fsDispatch({ type: "LOAD", payload: { path: "/", nodes } });
    } catch (error) {
      console.log(error);
    }
  }, [uuid]);
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
      default:
        break;
    }
  };
  const handleStalePaths = useCallback(async () => {
    // Unwatch all stale paths
    // await Promise.all(fs.stalePaths.map((pathPair) => closeDir(uuid, pathPair[0])));
    // Watch all new "moved" paths
    const newPaths = fs.stalePaths.filter((pathPair) => !!pathPair[1]).map((pathPair) => pathPair[1]!);
    // const resps = await Promise.all(newPaths.map((newPath) => openDir(uuid, newPath)));
    // newPaths.forEach((newPath, idx) => {
    //   if (resps?.[idx]?.data) {
    //     fsDispatch({
    //       type: "LOAD",
    //       payload: { path: newPath, nodes: resps[idx].data as unknown as FNode[], forceOpen: true },
    //     });
    //   }
    // });
    fsDispatch({ type: "CLEAR_STALE", payload: null });
  }, [fs.stalePaths, uuid]);

  useEffect(() => {
    init();
    socket.on("fs", handleFSMessage);

    return () => {
      socket.off("fs", handleFSMessage);
      socket.emit("msg", { service: "env", action: "fs.close", payload: { uuid, path: "/" } });
    };
  }, [init, uuid]);
  useEffect(() => {
    handleStalePaths();
  }, [fs.stalePaths, handleStalePaths]);

  const open = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        // const res = await openDir(uuid, path);
        // const nodes = res.data as unknown as FNode[];
        // fsDispatch({ type: "LOAD", payload: { path, nodes } });
      } catch (error) {
        console.log(error);
      }
    } else {
      const node = fs.pathMap.get(path);
      if (!node || node.isOpen) return;

      try {
        const codeEditor = editor.create(document.getElementById("editor")!, {
          value: "",
          language: "javascript",
        });
        const model = codeEditor.getModel()!;
        const doc = new Doc();
        const yText = doc.getText("monaco");
        const provider = new WebsocketProvider(uuid, socket, doc, path);
        const binding = new MonacoBinding(yText, model, new Set([codeEditor]), provider.awareness);
        // await openFile(uuid, path);
        fsDispatch({ type: "OPEN_FILE", payload: { path, provider, binding, editor: codeEditor, doc } });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const close = async (path: string, isDir: boolean) => {
    if (isDir) {
      try {
        // await closeDir(uuid, path);
        fsDispatch({ type: "UNLOAD", payload: { path } });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        // await closeFile(uuid, path);
        fsDispatch({ type: "CLOSE_FILE", payload: { path } });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const save = async (path: string) => {
    try {
      // await saveFile(uuid, path);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <EnvContext.Provider value={{ open, close, save }}>
        <div style={{ textAlign: "left" }}>
          {fs.root.children!.map((node, index) => (
            <FileNode key={index} node={node} />
          ))}
        </div>
      </EnvContext.Provider>
      <div id="editor" style={{ height: "40vh" }}></div>
    </>
  ); */

  const [count, setCount] = useState(0);

  return <div className={classes.explorer}>Explorer</div>;
};

export default Explorer;
