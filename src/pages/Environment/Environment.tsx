import { useLoaderData, useNavigate } from "react-router";

import classes from "./Environment.module.css";
import { workspaceLoader } from "@/router/guards";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { selectWorkspaceById } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import TitleBar from "@/components/env/TitleBar/TitleBar";
import ActivityBar from "@/components/env/ActivityBar/ActivityBar";
import TabGroup from "@/components/env/TabGroup/TabGroup";
import TerminalGroup from "@/components/env/TerminalGroup/TerminalGroup";
import StatusBar from "@/components/env/StatusBar/StatusBar";
import Explorer from "@/components/env/Explorer/Explorer";

import { useEffect, useRef, useState } from "react";

import layoutDesktop from "@/assets/layouts/desktop.json";
import layoutMobile from "@/assets/layouts/mobile.json";
import { Panel, PanelSchema } from "@/components/common/Panel/Panel";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { ViewContext } from "@/context/view/view.context";
import { closeEnv, openEnv, setUuid } from "@/store/env";
import Spinner from "@/components/common/Spinner/Spinner";
import { notify } from "@/store/notifications";
import { ProvisionPayload } from "@/models/workspace";
import { socket } from "@/config/socket";
// const schemaMobile = layoutMobile as PanelSchema;
const schemaDesktop = layoutDesktop as PanelSchema;

const views = {
  title: <TitleBar />,
  activity: <ActivityBar />,
  explorer: <Explorer />,
  tabgroup: <TabGroup />,
  terminal: <TerminalGroup />,
  status: <StatusBar />,
};

export const Environment = () => {
  const workspaceId = useLoaderData<typeof workspaceLoader>();
  const workspace = useAppSelector((state) => selectWorkspaceById(state, workspaceId))!;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const schema = isMobile ? /* schemaMobile */ schemaDesktop : schemaDesktop;
  const [dimension, setDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(true);
  const [waitMsg, setWaitMsg] = useState("Connecting to workspace...");
  const [provStatus, setProvStatus] = useState<ProvisionPayload | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(provStatus);
    if (provStatus?.action === "error") {
      dispatch(
        notify({
          title: "Could not connect to workspace",
          status: "error",
          message: "Something went wrong while connecting to your workspace, please try again later",
        })
      );
      navigate(-1);
      socket?.off("provision");
    } else if (provStatus?.action === "success" || provStatus?.action === "ready") {
      dispatch(setUuid(workspace.uuid));
      socket?.off("provision");
      setBusy(false);
    } else {
      if (!provStatus) return;
      setWaitMsg(provStatus.payload.message);
    }
  }, [dispatch, navigate, provStatus, workspace.uuid]);

  const init = async (sessionId: string) => {
    socket?.on("provision", (msg) => setProvStatus(msg));
    const res = await dispatch(openEnv({ uuid: workspace.uuid, sessionId }));
    const { success, wait } = res.payload as { success: boolean; wait?: boolean };
    console.log(success, wait);
    if (success) {
      if (wait) return;

      socket?.off("provision");
      dispatch(setUuid(workspace.uuid));
      setBusy(false);
    } else {
      navigate(-1);
    }
  };
  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      dispatch(notify({ title: "No session", message: "Session inactive", status: "warning" }));
      navigate(-1);
      return;
    }
    init(sessionId);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimension({ width: rect.width, height: rect.height });
    }

    socket.on("env", (msg) => {
      if (msg.action === "disconnect") {
        navigate(-1);
      }
    });

    return () => {
      console.log("Closing");
      socket?.off("env");
      dispatch(closeEnv({ uuid: workspace.uuid, sessionId }));
    };
  }, []);

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
  const nodes = useRef(new Map<string, ReturnType<typeof createHtmlPortalNode>>());

  const getNode = (viewId: string) => {
    if (!nodes.current.has(viewId)) {
      nodes.current.set(viewId, createHtmlPortalNode({ attributes: { class: classes.wrapper } }));
    }
    return nodes.current.get(viewId)!;
  };

  return busy ? (
    <div className={classes.wait}>
      <Spinner size={2}>{waitMsg}</Spinner>
    </div>
  ) : (
    <ViewContext.Provider value={{ getNode, workspace }}>
      <div ref={containerRef} className={classes.environment}>
        <Panel
          style={{ width: "100%", height: "100%" }}
          dimension={dimension}
          position={{ top: 0, left: 0 }}
          schema={schema}
        />

        {Object.entries(views).map(([viewId, view]) => (
          <InPortal key={viewId} node={getNode(viewId)}>
            {view}
          </InPortal>
        ))}
      </div>
    </ViewContext.Provider>
  );
};
