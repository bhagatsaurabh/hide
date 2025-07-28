import classNames from "classnames";
import classes from "./Terminal.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import { socket } from "@/config/socket";
import { getSSHKey } from "@/utils/driver";
import { auth } from "@/config/firebase";
import { ViewContext } from "@/context/view/view.context";
import { useAppDispatch } from "@/hooks/store";
import { SSHClosed, SSHError, SSHOpen, SSHOutput } from "@/models/ssh";
import { InSocketMessage } from "@/models/common";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";

interface TerminalProps {
  id: string;
  show: boolean;
  onClose: (guid: string) => void;
}

const Terminal = ({ id: guid, show, onClose }: TerminalProps) => {
  const { workspace } = useContext(ViewContext)!;
  const dispatch = useAppDispatch();
  const [sshSessId, setSSHSessId] = useState("");
  const term = useRef<XTerm>(null);
  const wrapperEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();

    return () => {
      socket.emit("msg", {
        service: "env",
        action: "ssh.close",
        payload: { uuid: workspace.uuid, sessionId: sshSessId },
      });
      setSSHSessId("");
      term.current?.dispose();
    };
  }, [dispatch, workspace.uuid]);

  const sshMsgHandler = (msg: InSocketMessage<"ssh">) => {
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
  };
  const init = async () => {
    const privateKey = await getSSHKey(auth.currentUser!.uid, workspace.uuid);

    socket.on("ssh", sshMsgHandler);

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
    setSSHSessId(payload.sessionId);

    term.current = new XTerm();
    const fitAddon = new FitAddon();
    const clipboardAddon = new ClipboardAddon();
    term.current.loadAddon(fitAddon);
    term.current.loadAddon(clipboardAddon);
    term.current.loadAddon(new WebLinksAddon());

    term.current.open(wrapperEl.current!);
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
    onClose(guid);
  };

  return (
    <div
      ref={wrapperEl}
      className={classNames({
        [classes.term]: true,
        [classes.active]: show,
      })}
    ></div>
  );
};

export default Terminal;
