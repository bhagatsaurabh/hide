import { useLoaderData, useNavigate } from "react-router";

import classes from "./Environment.module.css";
import { workspaceLoader } from "@/router/guards";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { selectWorkspaceById } from "@/store/workspace";
import { useMediaQuery } from "@/hooks/media-query";
import TitleBar from "@/components/env/TitleBar/TitleBar";
import ActivityBar from "@/components/env/ActivityBar/ActivityBar";
import TabGroup, { TabGroupRef } from "@/components/env/TabGroup/TabGroup";
import TerminalGroup from "@/components/env/TerminalGroup/TerminalGroup";
import StatusBar from "@/components/env/StatusBar/StatusBar";
import Explorer, { ExplorerRef } from "@/components/env/Explorer/Explorer";

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
import { FNodeOf } from "@/models/filesystem";
// const schemaMobile = layoutMobile as PanelSchema;
const schemaDesktop = layoutDesktop as PanelSchema;

const views = {
  title: TitleBar,
  activity: ActivityBar,
  explorer: Explorer,
  tabgroup: TabGroup,
  terminal: TerminalGroup,
  status: StatusBar,
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
      socket?.off("env");
      dispatch(closeEnv({ uuid: workspace.uuid, sessionId }));
    };
  }, []);

  const nodes = useRef(new Map<string, ReturnType<typeof createHtmlPortalNode>>());
  const tabGroupRef = useRef<TabGroupRef>(null);
  const explorerRef = useRef<ExplorerRef>(null);

  const getNode = (viewId: string) => {
    if (!nodes.current.has(viewId)) {
      nodes.current.set(viewId, createHtmlPortalNode({ attributes: { class: classes.wrapper } }));
    }
    return nodes.current.get(viewId)!;
  };
  const loadFile = (fnode: FNodeOf<"file">) => {
    tabGroupRef.current?.add(fnode);
  };
  const closeFile = (fnode: FNodeOf<"file">) => {
    explorerRef.current?.closeFile(fnode);
  };

  return busy ? (
    <div className={classes.wait}>
      <Spinner size={2}>{waitMsg}</Spinner>
    </div>
  ) : (
    <ViewContext.Provider value={{ getNode, workspace, loadFile, closeFile }}>
      <div ref={containerRef} className={[classes.environment, "scrollbar"].join(" ")}>
        <Panel
          style={{ width: "100%", height: "100%" }}
          dimension={dimension}
          position={{ top: 0, left: 0 }}
          schema={schema}
        />

        {Object.entries(views).map(([viewId, View]) => (
          <InPortal key={viewId} node={getNode(viewId)}>
            <View
              ref={(el: unknown) => {
                if (viewId === "tabgroup") {
                  tabGroupRef.current = el as TabGroupRef;
                } else if (viewId === "explorer") {
                  explorerRef.current = el as ExplorerRef;
                }
              }}
            />
          </InPortal>
        ))}
      </div>
    </ViewContext.Provider>
  );
};
