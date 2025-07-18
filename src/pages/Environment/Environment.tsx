import { useLoaderData } from "react-router";

import { workspaceLoader } from "@/router/guards";
import { useAppSelector } from "@/hooks/store";
import { selectWorkspaceById } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import HDE from "@/components/environment";
import classes from "./Environment.module.css";
import { Explorer } from "@/components/Explorer/Explorer";

export const Environment = () => {
  const workspaceId = useLoaderData<typeof workspaceLoader>();
  const workspace = useAppSelector((state) => selectWorkspaceById(state, workspaceId))!;
  const isLight = useMediaQuery("(max-width: 767px)");
  /* const term = useRef<Terminal>(null);
  const termEl = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState(""); */

  /* useEffect(() => {
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
  }, [dispatch, workspace.uuid]); */

  /* const handleNewTerminal = async () => {
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
  }; */

  return (
    <>
      <TitleBar />
      <main>
        <ActivityBar />
        <div className={classes.panel}>
          <Explorer uuid={workspace.uuid} />
          <div className={classes.view} ref={}></div>
        </div>
        <div className={classes.panel}>
          <TabGroup />
          <div className={classes.view} ref={}></div>
        </div>
        <TerminalGroup targetRef={moveToA ? containerARef : containerBRef} />
      </main>
      <StatusBar />
      {/* <div>
        <h2>{workspace.name}</h2>
        <h4>{workspace.uuid}</h4>
        <h3>{workspace.description}</h3>
        <h5>{workspace.createdAt}</h5>
      </div> */}
      {/* {isLight ? <HDE.Light /> : <HDE.Full />} */}
      {/* <button onClick={handleNewTerminal}>Connect</button>
      {sessionId && <button onClick={handleCloseTerminal}>Close</button>}
      <div ref={termEl} style={{ width: "100%", height: "20rem", textAlign: "left" }}></div> */}
    </>
  );
};
