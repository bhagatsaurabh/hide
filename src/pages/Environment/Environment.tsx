import { useLoaderData } from "react-router";

import classes from "./Environment.module.css";
import { workspaceLoader } from "@/router/guards";
import { useAppSelector } from "@/hooks/store";
import { selectWorkspaceById } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import { ViewProvider } from "@/context/view/ViewProvider";
import TitleBar from "@/components/env/TitleBar/TitleBar";
import ActivityBar from "@/components/env/ActivityBar/ActivityBar";
import TabGroup from "@/components/env/TabGroup/TabGroup";
import TerminalGroup from "@/components/env/TerminalGroup/TerminalGroup";
import StatusBar from "@/components/env/StatusBar/StatusBar";
import Explorer from "@/components/env/Explorer/Explorer";

import { useEffect } from "react";

import layoutDesktop from "@/assets/layouts/desktop.json";
import layoutMobile from "@/assets/layouts/mobile.json";
import { Panel, PanelSchema } from "@/components/common/Panel/Panel";
import { View } from "@/components/common/View/View";
const schemaMobile = layoutMobile as PanelSchema;
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
  const schema = isMobile ? schemaMobile : schemaDesktop;

  useEffect(() => {
    console.log("Mounted: Environment");
    return () => console.log("Unmounted: Environment");
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

  return (
    <ViewProvider>
      <div style={{ display: "flex", height: "100vh", color: "beige" }}>
        <Panel schema={schema} />

        {Object.entries(views).map(([viewId, view]) => (
          <View key={viewId} viewId={viewId}>
            {view}
          </View>
        ))}
      </div>
    </ViewProvider>
  );
};
