import { useCallback, useEffect, useReducer } from "react";
import { FileNode as FNode, fileTreeReducer } from "@/reducers/explorer";
import { FileNode } from "../FileNode/FileNode";
import { closeDir, openDir } from "@/services/env";
import { FSEvent } from "@/models/filesystem";
import { socket } from "@/config/socket";
import { EnvContext } from "@/pages/Environment/context";

interface ExplorerProps {
  uuid: string;
}

export const Explorer = ({ uuid }: ExplorerProps) => {
  const [fs, fsDispatch] = useReducer(fileTreeReducer, {
    root: { id: 0, name: "workspace", path: "/home/devuser/workspace", type: "dir", isOpen: false, children: [] },
    pathMap: new Map(),
  });

  const init = useCallback(async () => {
    try {
      const res = await openDir(uuid, "/");
      const nodes = res.data as unknown as FNode[];
      nodes.forEach((node) => {
        if (node.type === "dir") node.children = [];
      });
      fsDispatch({ type: "LOAD", payload: { path: "/", nodes } });
    } catch (error) {
      console.log(error);
    }
  }, [uuid]);
  const setListeners = () => {
    socket.on("fs", (msg: FSEvent) => {
      console.log(msg);
      // TODO
    });
  };

  useEffect(() => {
    init();
    setListeners();

    return () => {
      socket.emit("fs", { action: "close", payload: { path: "/" } });
    };
  });

  const open = async (path: string) => {
    try {
      const res = await openDir(uuid, path);
      const nodes = res.data as unknown as FNode[];
      nodes.forEach((node) => node.type === "dir" && (node.children = []));
      fsDispatch({ type: "LOAD", payload: { path, nodes } });
    } catch (error) {
      console.log(error);
    }
  };
  const close = async (path: string) => {
    try {
      await closeDir(uuid, path);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <EnvContext.Provider value={{ open, close }}>
      <div>
        {fs.root.children!.map((node, index) => (
          <FileNode key={index} node={node} />
        ))}
      </div>
    </EnvContext.Provider>
  );
};
