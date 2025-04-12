import { useCallback, useEffect, useRef } from "react";
import { useLoaderData } from "react-router";
import { workspaceLoader } from "@/router/guards";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { socket } from "@/config/socket";
import { getSSHKey } from "@/utils/driver";
import { auth } from "@/config/firebase";

export const Environment = () => {
  const workspace = useLoaderData<typeof workspaceLoader>();
  const term = useRef<Terminal>(null);
  const termEl = useRef<HTMLDivElement>(null);

  const connectSSH = useCallback(async () => {
    const privateKey = await getSSHKey(auth.currentUser!.uid, workspace.uuid);

    socket.on("ssh:output", (data) => term.current!.write(data));
    socket.on("ssh:error", (err) => console.error("SSH Error:", err));
    socket.on("ssh:closed", (msg) => console.log("SSH Closed:", msg));

    socket.emit("ssh:request", {
      privateKey,
      workspaceUUID: workspace.uuid,
    });
  }, [workspace.uuid]);

  useEffect(() => {
    term.current = new Terminal();
    const fitAddon = new FitAddon();
    const clipboardAddon = new ClipboardAddon();
    term.current.loadAddon(fitAddon);
    term.current.loadAddon(clipboardAddon);
    term.current.loadAddon(new WebLinksAddon());

    term.current.open(termEl.current!);
    fitAddon.fit();
    term.current.write("Connecting...");
    term.current.onData((data) => socket.emit("ssh:data", data));

    connectSSH();
  }, [connectSSH]);

  return (
    <>
      <div>
        <h2>{workspace.name}</h2>
        <h4>{workspace.uuid}</h4>
        <h3>{workspace.description}</h3>
        <h5>{workspace.createdAt}</h5>
      </div>
      <div ref={termEl} style={{ width: "100%", height: "20rem" }}></div>
    </>
  );
};
