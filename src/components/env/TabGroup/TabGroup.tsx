import { CSSProperties, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import classes from "./TabGroup.module.css";
import Icon from "@/components/common/Icon/Icon";
import classNames from "classnames";
import { TooltipContext } from "@/context/tooltip/tooltip.context";
import { base64ToU8, getFileIcon, u8ToBase64 } from "@/utils";
import { FNode, FNodeOf } from "@/models/filesystem";
import Spinner from "@/components/common/Spinner/Spinner";
import { editor as mEditor, Uri } from "monaco-editor";
import { Doc } from "yjs";
import { WebsocketProvider } from "@/lib/y-websocket";
import { MonacoBinding } from "y-monaco";
import { ViewContext } from "@/context/view/view.context";
import { socket } from "@/config/socket";
import { InSocketMessage } from "@/models/common";
import { auth } from "@/config/firebase";
import bus from "@/config/bus";
import { Unsubscribe } from "nanoevents";
import Button from "@/components/common/Button/Button";

type TabMetaData = {
  node: FNodeOf<"file">;
  isDisplaced?: boolean;
  isDisconnected?: boolean;
  isConflicting?: boolean;
  conflictResolver?: string;
};
type TabData = {
  uri: Uri;
  doc: Doc;
  model: mEditor.ITextModel;
  provider: WebsocketProvider;
  binding: MonacoBinding;
  node: FNodeOf<"file">;
};

export interface TabGroupRef {
  add: (fnode: FNodeOf<"file">, conflict?: { isConflicting?: boolean; conflictResolver?: string }) => void;
}

interface TabGroupProps {
  ref: Ref<TabGroupRef>;
}

const TabGroup = ({ ref }: TabGroupProps) => {
  const [tabsMeta, setTabsMeta] = useState<TabMetaData[]>([]);
  const tabs = useRef<Record<number, TabData>>({});
  const [active, setActive] = useState<TabMetaData | null>(null);
  const { showTooltip, hideTooltip } = useContext(TooltipContext)!;
  const headingEl = useRef<HTMLDivElement>(null);
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<mEditor.IStandaloneCodeEditor>(null);
  const [busy, setBusy] = useState(false);
  const { workspace, closeFile, awareness } = useContext(ViewContext)!;
  const tabGroupEl = useRef<HTMLDivElement>(null);
  const awarenessStyleSheet = useRef<CSSStyleSheet>(null);
  const awarenessStyleEl = useRef<HTMLStyleElement>(null);
  const awarenessStyleIdxMap = useRef<Map<number, number[]>>(new Map());
  const userColors = useRef<Map<string, { default: string; transparent: string }>>(
    new Map(awareness.map((entry) => [entry.profile.userId, entry.color]))
  );
  const [busyConflict, setBusyConflict] = useState("");

  useEffect(() => {
    userColors.current = new Map(awareness.map((entry) => [entry.profile.userId, entry.color]));
  }, [awareness]);
  useEffect(() => {
    const handleSyncMessage = (msg: InSocketMessage<"fs">) => {
      if (msg.action !== "sync") return;
      const tab = tabs.current[msg.payload.ino];
      if (!tab) return;
      tab.provider.receive(base64ToU8(msg.payload.buf).buffer);
      // ??? tab.provider.receive(base64ToU8(msg.payload.buf));
    };

    socket?.on("fs", handleSyncMessage);
    return () => void socket?.off("fs", handleSyncMessage);
  }, []);
  useEffect(() => {
    const handleResize = (viewId?: string) => {
      if (!viewId || viewId === "tabgroup") {
        editor.current?.layout();
      }
    };

    const unsub = bus.on("internal.env.resize", (ctx) => handleResize(ctx?.viewId));
    return () => unsub();
  }, []);
  useEffect(() => {
    const handleExtAction = (action: "undo" | "redo" | "find" | "replace") => {
      if (!active) return;
      if (action === "undo" || action === "redo") {
        editor.current?.trigger("keyboard", action, null);
      } else if (action === "find") {
        editor.current?.getAction("actions.find")?.run();
      } else {
        editor.current?.getAction("editor.action.startFindReplaceAction")?.run();
      }
    };

    const unsubs: Unsubscribe[] = [];
    unsubs.push(bus.on("edit.undo", () => handleExtAction("undo")));
    unsubs.push(bus.on("edit.redo", () => handleExtAction("redo")));
    unsubs.push(bus.on("edit.find", () => handleExtAction("find")));
    unsubs.push(bus.on("edit.replace", () => handleExtAction("replace")));

    return () => unsubs.forEach((unsub) => unsub());
  }, [active]);
  useEffect(() => {
    const handleFileDisplaced = (ino: number) => {
      const updatedTabsMeta = [...tabsMeta];
      const tabMeta = updatedTabsMeta.find((tabMeta) => tabMeta.node.id === ino);
      if (!tabMeta) return;

      tabMeta.isDisplaced = true;
      setTabsMeta(updatedTabsMeta);
    };
    const handleFileDisconnected = (ino: number) => {
      const updatedTabsMeta = [...tabsMeta];
      const tabMeta = updatedTabsMeta.find((tabMeta) => tabMeta.node.id === ino);
      if (!tabMeta) return;

      tabMeta.isDisconnected = true;
      setTabsMeta(updatedTabsMeta);
    };
    const handleFileConflict = (ino: number, resolverUid: string) => {
      const updatedTabsMeta = [...tabsMeta];
      const tabMeta = updatedTabsMeta.find((tabMeta) => tabMeta.node.id === ino);
      if (!tabMeta) return;

      tabMeta.isConflicting = true;
      tabMeta.conflictResolver = resolverUid;
      setTabsMeta(updatedTabsMeta);
      setBusyConflict("");
    };
    const handleFileResolved = (ino: number) => {
      const updatedTabsMeta = [...tabsMeta];
      const tabMeta = updatedTabsMeta.find((tabMeta) => tabMeta.node.id === ino);
      if (!tabMeta) return;

      tabMeta.isConflicting = false;
      delete tabMeta.conflictResolver;
      setTabsMeta(updatedTabsMeta);
      setBusyConflict("");
    };

    const unsubs: Unsubscribe[] = [];
    unsubs.push(bus.on("internal.file.disconnected", ({ ino }) => handleFileDisconnected(ino)));
    unsubs.push(bus.on("internal.file.displaced", ({ ino }) => handleFileDisplaced(ino)));
    unsubs.push(bus.on("internal.file.conflict", ({ ino, resolverUid }) => handleFileConflict(ino, resolverUid)));
    unsubs.push(bus.on("internal.file.conflict.resolved", ({ ino }) => handleFileResolved(ino)));

    return () => unsubs.forEach((unsub) => unsub());
  }, [tabsMeta]);
  useEffect(() => {
    mEditor.defineTheme("hide-default", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#fffff0" },
    });
    editor.current = mEditor.create(editorEl.current!);
    mEditor.setTheme("hide-default");

    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    awarenessStyleSheet.current = styleEl.sheet;
    awarenessStyleEl.current = styleEl;

    const el = headingEl.current;
    const scrollHandler = (e: WheelEvent) => {
      el?.scrollBy(e.deltaY, 0);
    };
    el?.addEventListener("wheel", scrollHandler);

    return () => {
      el?.removeEventListener("wheel", scrollHandler);
      editor.current?.dispose();
      if (awarenessStyleEl.current) {
        document.head.removeChild(awarenessStyleEl.current);
      }
    };
  }, []);
  useEffect(() => {
    if (active && tabs.current[active.node.id]?.model) {
      editor.current!.setModel(tabs.current[active.node.id]?.model);
    }
  }, [active]);

  const handleTabAdd = (fnode: FNode, conflict: { isConflicting?: boolean; conflictResolver?: string } = {}) => {
    setBusy(true);

    const uri = Uri.parse(`inmemory://model/${fnode.path}`);
    const doc = new Doc();
    const provider = new WebsocketProvider(
      workspace.memberships.find((mem) => mem.userId === auth.currentUser!.uid)!,
      workspace.uuid,
      socket,
      doc,
      fnode.id,
      (ino, buf) => {
        socket.emit("msg", {
          service: "env",
          action: "fs.sync",
          payload: { uuid: workspace.uuid, ino, buf: u8ToBase64(buf) },
        });
      },
      ({ added, removed }, state) => {
        added.forEach((clientId) => {
          const color = userColors.current.get(state.get(clientId)!.user.uid) ?? {
            default: "#000000",
            transparent: "#00000088",
          };
          const idx0 = awarenessStyleSheet.current?.insertRule(`
            .yRemoteSelection-${clientId} {
              background-color: ${color.transparent};
            }
          `);
          const idx1 = awarenessStyleSheet.current?.insertRule(`
            .yRemoteSelectionHead-${clientId} {
              position: absolute;
              border-left: ${color.transparent} solid 2px;
              border-top: ${color.transparent} solid 2px;
              border-bottom: ${color.transparent} solid 2px;
              height: 100%;
              box-sizing: border-box;
            }
          `);
          const idx2 = awarenessStyleSheet.current?.insertRule(`
            .yRemoteSelectionHead-${clientId}::after {
              position: absolute;
              content: " ";
              border: 3px solid ${color.transparent};
              border-radius: 4px;
              left: -4px;
              top: -5px;
            }
          `);
          awarenessStyleIdxMap.current.set(clientId, [idx0!, idx1!, idx2!]);
        });
        removed.forEach((clientId) => {
          const idxs = awarenessStyleIdxMap.current.get(clientId) ?? [];
          idxs.forEach((idx) => {
            awarenessStyleSheet.current?.deleteRule(idx);
          });
          awarenessStyleIdxMap.current.delete(clientId);
        });
      }
    );
    const yText = doc.getText("monaco");
    const model = mEditor.createModel("", undefined, uri);
    const binding = new MonacoBinding(yText, model, new Set([editor.current!]), provider.awareness);

    const newTab: TabData = { binding, doc, node: fnode as FNodeOf<"file">, provider, uri, model };
    tabs.current[fnode.id] = newTab;
    const newTabMeta: TabMetaData = { node: fnode as FNodeOf<"file"> };
    const updatedTabsMeta = [...tabsMeta, newTabMeta];
    if (conflict.isConflicting) {
      newTabMeta.isConflicting = conflict.isConflicting;
      newTabMeta.conflictResolver = conflict.conflictResolver;
      setBusyConflict("");
    }
    setTabsMeta(updatedTabsMeta);
    setActive(newTabMeta);

    // Client ready
    socket.emit("msg", {
      service: "env",
      action: "fs.open.ack",
      payload: { uuid: workspace.uuid, ino: fnode.id },
    });

    setBusy(false);
  };
  const handleTabRemove = (tabMetaToRemove: TabMetaData) => {
    const updatedTabsMeta = [...tabsMeta];
    updatedTabsMeta.splice(
      updatedTabsMeta.findIndex((tabMeta) => tabMeta === tabMetaToRemove),
      1
    );
    const tabToRemove = tabs.current[tabMetaToRemove.node.id];
    tabToRemove.binding.destroy();
    tabToRemove.provider.destroy();
    tabToRemove.model.dispose();
    tabToRemove.doc.destroy();

    if (active === tabMetaToRemove) {
      if (updatedTabsMeta.length > 0) {
        setActive(updatedTabsMeta[0]);
        editor.current!.setModel(tabs.current[updatedTabsMeta[0].node.id].model);
      } else {
        setActive(null);
        editor.current!.setModel(null);
      }
    }

    setTabsMeta(updatedTabsMeta);
    delete tabs.current[tabMetaToRemove.node.id];
    closeFile(tabToRemove.node);
  };
  const handleConflictAction = (active: TabMetaData, decision: "keep" | "reload") => {
    socket.emit("msg", {
      service: "env",
      action: "fs.conflict.resolve",
      payload: { ino: active.node.id, uuid: workspace.uuid, decision },
    });
    setBusyConflict(decision);
  };

  useImperativeHandle(ref, () => {
    return {
      add: handleTabAdd,
    };
  });

  const resolverProfile = awareness.find((awareness) => awareness.profile.userId === active?.conflictResolver);

  return (
    <div className={classes.tabgroup} ref={tabGroupEl}>
      <div ref={headingEl} className={[classes.heading, "scrollable"].join(" ")}>
        {tabsMeta.map((tabMeta) => (
          <div
            key={tabMeta.node.id}
            className={classNames({
              [classes.tabhead]: true,
              [classes.active]: tabMeta.node.id === active?.node.id,
            })}
            onMouseEnter={(e) => showTooltip(tabMeta.node.path, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            onClick={() => setActive(tabMeta)}
          >
            <Icon name={getFileIcon(tabMeta.node.name)} prefix="editor" />
            <span className={classNames({ [classes.name]: true, [classes.displaced]: tabMeta.isDisplaced })}>
              {tabMeta.node.name}
            </span>
            &nbsp;
            {tabMeta.isConflicting && <span className={classes.conflictname}>(conflict)</span>}
            <button
              onMouseEnter={(e) => showTooltip("Close", e.clientX, e.clientY)}
              onMouseLeave={hideTooltip}
              onClick={() => handleTabRemove(tabMeta)}
            >
              <Icon name="close" strokeWidth={0.4} size={0.6} asset />
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
        {!busy && active && active.isDisconnected && (
          <div className={classes.disconnected}>
            <h3>Something went wrong</h3>
            <h4>File disconnected, please reopen</h4>
            <Button className="py-0p2 px-0p75" type="secondary" onClick={() => handleTabRemove(active)}>
              Close
            </Button>
          </div>
        )}
        {!busy && active && !active.isDisconnected && active.isConflicting && (
          <div className={classes.conflict}>
            <h3>File contents changed on disk</h3>
            {active.conflictResolver === auth.currentUser!.uid ? (
              <>
                <h4>
                  Do you want to keep your changes (overwrite file on disk) or reopen the file from disk (overwrite
                  current changes) ?
                </h4>
                <br />
                <Button
                  className="py-0p2 px-0p75 mb-0p5"
                  type="secondary"
                  onClick={() => handleConflictAction(active, "keep")}
                  busy={busyConflict === "keep"}
                >
                  Keep changes
                </Button>
                <Button
                  className="py-0p2 px-0p75"
                  type="tertiary"
                  onClick={() => handleConflictAction(active, "reload")}
                  busy={busyConflict === "reload"}
                >
                  Reload file
                </Button>
              </>
            ) : (
              <>
                <h4>
                  User{" "}
                  <span
                    style={{ "--resolver-accent": resolverProfile?.color.default ?? "#afafaf" } as CSSProperties}
                    className={classes.resolver}
                  >
                    @{resolverProfile?.profile.username ?? "Unknown"}
                  </span>{" "}
                  is making a decision on whether to keep the current changes or reload from disk
                </h4>
              </>
            )}
          </div>
        )}
        <div ref={editorEl} className={classNames({ [classes.wrapper]: true, [classes.active]: !!active })}></div>
      </div>
    </div>
  );
};

export default TabGroup;
