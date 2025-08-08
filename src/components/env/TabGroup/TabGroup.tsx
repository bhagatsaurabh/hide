import { Ref, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import classes from "./TabGroup.module.css";
import Icon from "@/components/common/Icon/Icon";
import classNames from "classnames";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import { base64ToU8, getFileIcon, u8ToBase64 } from "@/utils";
import { FNode, FNodeOf } from "@/models/filesystem";
import Spinner from "@/components/common/Spinner/Spinner";
import { editor, editor as mEditor, Uri } from "monaco-editor";
import { Doc } from "yjs";
import { WebsocketProvider } from "@/lib/y-websocket";
import { MonacoBinding } from "y-monaco";
import { ViewContext } from "@/context/view/view.context";
import { socket } from "@/config/socket";
import { InSocketMessage } from "@/models/common";

type TabData = {
  uri: Uri;
  doc: Doc;
  model: mEditor.ITextModel;
  provider: WebsocketProvider;
  binding: MonacoBinding;
  node: FNodeOf<"file">;
};

export interface TabGroupRef {
  add: (fnode: FNodeOf<"file">) => void;
}

interface TabGroupProps {
  ref: Ref<TabGroupRef>;
}

const TabGroup = ({ ref }: TabGroupProps) => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [active, setActive] = useState<TabData | null>(null);
  const { showTooltip, hideTooltip } = useContext(TooltipContext)!;
  const headingEl = useRef<HTMLDivElement>(null);
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<editor.IStandaloneCodeEditor>(null);
  const [busy, setBusy] = useState(false);
  const { workspace, closeFile } = useContext(ViewContext)!;

  const handleSyncMessage = useCallback(
    (msg: InSocketMessage<"fs">) => {
      if (msg.action !== "sync") return;
      console.log("Sync", msg.payload, tabs);
      const tab = tabs.find((tab) => tab.node.path === msg.payload.path);
      if (!tab) return;
      tab.provider.receive(base64ToU8(msg.payload.buf));
    },
    [tabs]
  );

  useEffect(() => {
    editor.current = mEditor.create(editorEl.current!);

    const el = headingEl.current;
    const scrollHandler = (e: WheelEvent) => {
      el?.scrollBy(e.deltaY, 0);
    };
    el?.addEventListener("wheel", scrollHandler);

    socket?.on("fs", handleSyncMessage);

    return () => {
      socket?.off("fs", handleSyncMessage);
      el?.removeEventListener("wheel", scrollHandler);
      editor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (active?.model) {
      editor.current!.setModel(active.model);
    }
  }, [active]);

  const handleTabAdd = (fnode: FNode) => {
    setBusy(true);

    const uri = Uri.parse(`inmemory://model/${fnode.path}`);
    const doc = new Doc();
    const provider = new WebsocketProvider(workspace.uuid, socket, doc, fnode.path, (path, buf) => {
      console.log("Send", performance.now(), buf);
      socket.emit("msg", {
        service: "env",
        action: "fs.sync",
        payload: { uuid: workspace.uuid, path, buf: u8ToBase64(buf) },
      });
    });
    const yText = doc.getText("monaco");
    const model = mEditor.createModel("", undefined, uri);
    const binding = new MonacoBinding(yText, model, new Set([editor.current!]), provider.awareness);

    const newTab = { binding, doc, node: fnode as FNodeOf<"file">, provider, uri, model };
    const updatedTabs = [...tabs];
    updatedTabs.push(newTab);
    setTabs(updatedTabs);
    setActive(newTab);

    // Client ready
    socket.emit("msg", {
      service: "env",
      action: "fs.open.ack",
      payload: { uuid: workspace.uuid, path: fnode.path.substring(10) },
    });

    setBusy(false);
  };
  const handleTabRemove = (tabToRemove: TabData) => {
    const updatedTabs = [...tabs];
    updatedTabs.splice(
      updatedTabs.findIndex((tab) => tab === tabToRemove),
      1
    );
    tabToRemove.binding.destroy();
    tabToRemove.provider.destroy();
    tabToRemove.model.dispose();
    tabToRemove.doc.destroy();

    if (active === tabToRemove) {
      if (updatedTabs.length > 0) {
        editor.current!.setModel(updatedTabs[0].model);
        setActive(updatedTabs[0]);
      } else {
        editor.current!.setModel(null);
        setActive(null);
      }
    }

    setTabs(updatedTabs);
    closeFile(tabToRemove.node);
  };

  useImperativeHandle(ref, () => {
    return {
      add: handleTabAdd,
    };
  });

  return (
    <div className={classes.tabgroup}>
      <div ref={headingEl} className={[classes.heading, "scrollable"].join(" ")}>
        {tabs.map((tab) => (
          <div
            key={tab.node.id}
            className={classNames({
              [classes.tabhead]: true,
              [classes.active]: tab.node.id === active?.node.id,
            })}
            onMouseEnter={(e) => showTooltip(tab.node.path, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            onClick={() => setActive(tab)}
          >
            <Icon name={getFileIcon(tab.node.name)} fs />
            <span className={classes.name}>{tab.node.name}</span>
            <button
              onMouseEnter={(e) => showTooltip("Close", e.clientX, e.clientY)}
              onMouseLeave={hideTooltip}
              onClick={() => handleTabRemove(tab)}
            >
              <Icon name="close" strokeWidth={0.4} size={0.6} />
            </button>
          </div>
        ))}
      </div>
      <div className={classes.content}>
        {busy && (
          <div className={classes.wait}>
            <Spinner size={1.2}>Loading</Spinner>
          </div>
        )}
        <div ref={editorEl} className={classNames({ [classes.wrapper]: true, [classes.active]: !!active })}></div>
      </div>
    </div>
  );
};

export default TabGroup;
