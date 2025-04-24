import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { workspaceLoader } from "@/router/guards";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { socket } from "@/config/socket";
import { getSSHKey } from "@/utils/driver";
import { auth } from "@/config/firebase";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { openDirectory, selectExplorer } from "@/store/env";
import { Explorer } from "@/components/Explorer/Explorer";
import { FSSyncDTO } from "@/models/filesystem";

export const Environment = () => {
  const workspace = useLoaderData<typeof workspaceLoader>();
  const term = useRef<Terminal>(null);
  const termEl = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState("");
  const dispatch = useAppDispatch();
  const fileTree = useAppSelector(selectExplorer);

  useEffect(() => {
    dispatch(openDirectory({ uuid: workspace.uuid, path: "/" }));
    socket.on("fs", (msg: FSSyncDTO) => {
      console.log(msg);
    });

    return () => {
      socket.emit("ssh:closeall", { workspaceUUID: workspace.uuid });
      term.current?.dispose();
      socket.off("ssh:open");
      socket.off("ssh:output");
      socket.off("ssh:error");
      socket.off("ssh:closed");
      socket.off("fs");
    };
  }, [dispatch, workspace.uuid]);

  const handleNewTerminal = async () => {
    const privateKey = await getSSHKey(auth.currentUser!.uid, workspace.uuid);

    socket.on("ssh:open", (id) => {
      setSessionId(id);

      term.current = new Terminal();
      const fitAddon = new FitAddon();
      const clipboardAddon = new ClipboardAddon();
      term.current.loadAddon(fitAddon);
      term.current.loadAddon(clipboardAddon);
      term.current.loadAddon(new WebLinksAddon());

      term.current.open(termEl.current!);
      fitAddon.fit();
      term.current.write("Connecting...");
      term.current.onData((data) =>
        socket.emit("ssh:data", { workspaceUUID: workspace.uuid, sessionId: id, input: data })
      );
    });
    socket.on("ssh:output", (data) => term.current!.write(data.output));
    socket.on("ssh:error", (err) => {
      if (err.sessionId) {
        term.current?.write(err.message);
      } else {
        console.log(err);
      }
    });
    socket.on("ssh:closed", (_) => {
      term.current?.write("Disconnected");
    });

    socket.emit("ssh:request", {
      privateKey,
      workspaceUUID: workspace.uuid,
    });
  };
  const handleCloseTerminal = () => {
    socket.emit("ssh:close", { workspaceUUID: workspace.uuid, sessionId });
    setSessionId("");
    term.current?.dispose();
  };

  return (
    <>
      <div>
        <h2>{workspace.name}</h2>
        <h4>{workspace.uuid}</h4>
        <h3>{workspace.description}</h3>
        <h5>{workspace.createdAt}</h5>
      </div>
      <Explorer root={fileTree} />
      <button onClick={handleNewTerminal}>Connect</button>
      {sessionId && <button onClick={handleCloseTerminal}>Close</button>}
      <div ref={termEl} style={{ width: "100%", height: "20rem", textAlign: "left" }}></div>
    </>
  );
};
