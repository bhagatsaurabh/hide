import classNames from "classnames";
import classes from "./Terminal.module.css";
import { Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { socket } from "@/config/socket";
import { getSSHKey } from "@/utils/driver";
import { auth } from "@/config/firebase";
import { ViewContext } from "@/context/view/view.context";
import { SSHClosed, SSHError, SSHOpen, SSHOutput } from "@/models/ssh";
import { InSocketMessage } from "@/models/common";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";
import Spinner from "../common/Spinner/Spinner";
import bus from "@/config/bus";

export interface TerminalRef {
  handleSSHMessage: (msg: InSocketMessage<"ssh">) => void;
}
interface TerminalProps {
  id: string;
  show: boolean;
  ref?: Ref<TerminalRef | null>;
  onClose: (guid: string) => void;
}

const Terminal = ({ id: guid, show, ref, onClose }: TerminalProps) => {
  const { workspace } = useContext(ViewContext)!;
  const sshSessionId = useRef("");
  const term = useRef<XTerm>(null);
  const wrapperEl = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(true);
  const fitAddon = useRef<FitAddon>(null);

  useEffect(() => {
    init();

    return () => {
      socket.emit("msg", {
        service: "env",
        action: "ssh.close",
        payload: { uuid: workspace.uuid, sshSessionId: sshSessionId.current },
      });
      term.current?.dispose();
    };
  }, []);
  useImperativeHandle(ref, () => ({
    handleSSHMessage,
  }));

  const handleSSHMessage = (msg: InSocketMessage<"ssh">) => {
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
    term.current = new XTerm({
      theme: {
        background: "#f9f9e6",
        foreground: "#303030ff",
        cursor: "#000000",
        selectionBackground: "#b3b3b3ff",
      },
    });
    fitAddon.current = new FitAddon();
    const clipboardAddon = new ClipboardAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.loadAddon(clipboardAddon);
    term.current.loadAddon(new WebLinksAddon());

    term.current.open(wrapperEl.current!);
    fitAddon.current.fit();
    term.current.write("Connecting...");
    term.current.onData((data) => {
      socket.emit("msg", {
        service: "env",
        action: "ssh.data",
        payload: {
          uuid: workspace.uuid,
          sshSessionId: sshSessionId.current,
          input: data,
        },
      });
    });

    const privateKey = await getSSHKey(auth.currentUser!.uid, workspace.uuid);

    socket.emit("msg", {
      service: "env",
      action: "ssh.request",
      payload: {
        uuid: workspace.uuid,
        privateKey,
        clientId: guid,
      },
    });
  };
  useEffect(() => {
    const handleResize = () => {
      fitAddon.current?.fit();
      console.log("Resized Terminal");
    };

    const unsub = bus.on("internal.env.resize", () => handleResize());
    return () => unsub();
  }, []);
  const handleSSHOpen = (payload: SSHOpen) => {
    sshSessionId.current = payload.sshSessionId;
    setBusy(false);
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
    term.current?.write(`Disconnected: ${payload.sshSessionId}`);
    term.current?.dispose();
    onClose(guid);
  };

  return (
    <>
      {busy && (
        <div
          className={classNames({
            [classes.wait]: true,
            [classes.active]: show,
          })}
        >
          <Spinner size={1.5}>Connecting</Spinner>
        </div>
      )}
      <div
        ref={wrapperEl}
        className={classNames({
          [classes.term]: true,
          [classes.active]: show,
        })}
      ></div>
    </>
  );
};

export default Terminal;
