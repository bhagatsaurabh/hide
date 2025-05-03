import { useCallback, useEffect, useMemo, useReducer } from "react";
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
  }, [init]);

  const open = async (path: string) => {
    try {
      const res = await openDir(uuid, path);
      const nodes = res.data as unknown as FNode[];
      fsDispatch({ type: "LOAD", payload: { path, nodes } });
    } catch (error) {
      console.log(error);
    }
  };
  const close = async (path: string) => {
    try {
      await closeDir(uuid, path);
      fsDispatch({ type: "UNLOAD", payload: { path } });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <EnvContext.Provider value={{ open, close }}>
      <div style={{ textAlign: "left" }}>
        {fs.root.children!.map((node, index) => (
          <FileNode key={index} node={node} />
        ))}
      </div>
    </EnvContext.Provider>
  );
};
