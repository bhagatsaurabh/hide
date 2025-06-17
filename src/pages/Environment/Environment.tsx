import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";

import { workspaceLoader } from "@/router/guards";
import { socket } from "@/config/socket";
import { getSSHKey } from "@/utils/driver";
import { auth } from "@/config/firebase";
import { useAppDispatch } from "@/hooks/store";
import { Explorer } from "@/components/Explorer/Explorer";
import { SSHClosed, SSHError, SSHOpen, SSHOutput } from "@/models/ssh";

export const Environment = () => {
  const workspace = useLoaderData<typeof workspaceLoader>();
  const term = useRef<Terminal>(null);
  const termEl = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState("");
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      socket.emit("msg", {
        service: "env",
        action: "ssh.close",
        payload: {
          uuid: workspace.uuid,
          sessionId: "#all",
        },
      });
      term.current?.dispose();
      socket.off("ssh");
    };
  }, [dispatch, workspace.uuid]);

  const handleNewTerminal = async () => {
    const privateKey = await getSSHKey(auth.currentUser!.uid, workspace.uuid);

    socket.on("ssh", (msg) => {
      switch (msg.action) {
        case "open": {
          handleSSHOpen(msg.payload);
          break;
        }
        case "output": {
          handleSSHOutput(msg.payload);
          break;
        }
        case "error": {
          handleSSHError(msg.payload);
          break;
        }
        case "closed": {
          handleSSHClosed(msg.payload);
          break;
        }
        default:
          break;
      }
    });

    socket.emit("msg", {
      service: "env",
      action: "ssh.request",
      payload: {
        uuid: workspace.uuid,
        privateKey,
      },
    });
  };
  const handleSSHOpen = (payload: SSHOpen) => {
    setSessionId(payload.sessionId);

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
      socket.emit("msg", {
        service: "env",
        action: "ssh.data",
        payload: {
          uuid: workspace.uuid,
          sessionId: payload.sessionId,
          input: data,
        },
      })
    );
  };
  const handleSSHOutput = (payload: SSHOutput) => {
    term.current!.write(payload.output);
  };
  const handleSSHError = (payload: SSHError) => {
    if (payload.sessionId) {
      term.current?.write(payload.message);
    } else {
      console.error(payload);
    }
  };
  const handleSSHClosed = (payload: SSHClosed) => {
    term.current?.write(`Disconnected: ${payload.sessionId}`);
    term.current?.dispose();
  };

  const handleCloseTerminal = () => {
    socket.emit("msg", { service: "env", action: "ssh.close", payload: { uuid: workspace.uuid, sessionId } });
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
      <Explorer uuid={workspace.uuid} />
      <button onClick={handleNewTerminal}>Connect</button>
      {sessionId && <button onClick={handleCloseTerminal}>Close</button>}
      <div ref={termEl} style={{ width: "100%", height: "20rem", textAlign: "left" }}></div>
    </>
  );
};
