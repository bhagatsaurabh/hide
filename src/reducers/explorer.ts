import { WritableDraft } from "immer";
import { FNode, FNodeOf, FSCoalescedCreateEvent, FSCoalescedEvent, FSEvent, FTAction } from "@/models/filesystem";
import { getPath } from "@/utils";

type PathPair<T> = [T, T | undefined];
export type ExplorerState = {
  root: FNodeOf<"dir">;
  stalePaths: PathPair<string>[];
  draft: boolean;
};

export const fileTreeReducer = (draftState: WritableDraft<ExplorerState>, action: FTAction) => {
  switch (action.type) {
    case "LOAD": {
      const dirNode = findNode(draftState.root, action.payload.path);
      if (!dirNode || dirNode.type !== "dir") break;

      action.payload.nodes.forEach((node) => {
        if (node.type === "dir") node.children = [];
        node.parent = dirNode;
      });
      if (action.payload.forceOpen) {
        dirNode.isOpen = true;
      }
      dirNode.children = action.payload.nodes;
      break;
    }
    case "UNLOAD": {
      const dirNode = findNode(draftState.root, action.payload.path);
      if (!dirNode || dirNode.type !== "dir") break;

      if (action.payload.forceClose) {
        dirNode.isOpen = false;
      }
      dirNode.children = [];
      break;
    }
    case "OPEN_FILE": {
      const node = findNode(draftState.root, action.payload.path.substring(10));
      if (!node || node.type !== "file") break;
      node.isOpen = true;
      break;
    }
    case "CLOSE_FILE": {
      const node = findNode(draftState.root, action.payload.path.substring(10));
      if (!node || node.type !== "file") break;
      node.isOpen = false;
      break;
    }
    case "CLEAR_STALE": {
      if (draftState.stalePaths.length === 0) break;
      draftState.stalePaths = [];
      break;
    }
    case "BATCH": {
      const events = coalescer(action.payload.events);
      console.log("Batch coalesced:", JSON.parse(JSON.stringify(events)));
      events.forEach((event) => {
        if ((event.data as FSCoalescedCreateEvent).watchedPath) {
          const ev = event.data as FSCoalescedCreateEvent;
          ev.watchedPath = ev.watchedPath.replace("/workspace", "");
        }
      });

      const stalePaths: PathPair<string>[] = [];
      for (const event of events) {
        if (event.action === "create") {
          const dirNode = findNode(draftState.root, event.data.watchedPath);
          if (!dirNode || dirNode.type !== "dir") continue;
          const common = {
            id: event.data.ino!,
            name: event.data.path.substring(event.data.path.lastIndexOf("/") + 1),
            parent: dirNode,
            path: event.data.path,
          };
          let node: FNode;
          if (event.data.type === "dir") {
            node = { ...common, type: "dir", isOpen: false, children: [] };
          } else {
            node = { ...common, type: "file", isOpen: false };
          }

          const possibleDraft = findNode(draftState.root, node.path.substring(10));
          if (possibleDraft && possibleDraft.isDraft) {
            dirNode.children.splice(
              dirNode.children.findIndex((child) => child.id === possibleDraft.id),
              1
            );
            draftState.draft = false;
          }

          dirNode.children = [...dirNode.children, node];
        } else if (event.action === "move") {
          const oldDirNode = findNode(draftState.root, event.data.from);
          let newDirNode: FNode | undefined;
          if (event.data.to) newDirNode = findNode(draftState.root, event.data.to);
          const node = findNode(draftState.root, event.data.oldPath);
          if (!node) {
            continue;
          }
          let oldPath, newPath;
          if (oldDirNode && oldDirNode.type === "dir") {
            oldPath = getPath(node);
            oldDirNode.children.splice(
              oldDirNode.children.findIndex((n) => n === node),
              1
            );
          }
          if (newDirNode && newDirNode.type === "dir") {
            node.name = event.data.newPath!.substring(event.data.newPath!.lastIndexOf("/") + 1);
            node.parent = newDirNode;
            newDirNode.children.push(node);
            newPath = getPath(node);
          }
          if (node.type === "dir" && node.isOpen) {
            node.children?.forEach((child) => child.type === "dir" && (child.isOpen = false));
            node.isOpen = false;
            stalePaths.push([oldPath!, newPath]);
          }
        } else if (event.action === "modify") {
          // TODO: Notify users with possible integration with yjs & arbitration in-case of conflicts
          console.log("CONFLICT !");
        } else if (event.action === "remove") {
          // TODO: Notify users
          console.log("DELETED !");
          const dirNode = findNode(draftState.root, event.data.watchedPath);
          const node = findNode(draftState.root, event.data.path);
          if (!node) {
            continue;
          }
          if (dirNode && dirNode.type === "dir") {
            dirNode.children!.splice(
              dirNode.children!.findIndex((n) => n === node),
              1
            );
          }
        }
      }

      draftState.stalePaths.push(...stalePaths);
      break;
    }
    case "BLOCK": {
      if (action.payload.path === "/") action.payload.path += "workspace/";
      const blockedNode = findNode(draftState.root, action.payload.path.substring(10)) as FNodeOf<"dir">;
      if (blockedNode) {
        blockedNode.isBlocked = true;
      }
      break;
    }
    case "RESUME": {
      if (action.payload.path === "/") action.payload.path += "workspace/";
      const blockedNode = findNode(draftState.root, action.payload.path.substring(10)) as FNodeOf<"dir">;
      if (blockedNode) {
        blockedNode.isBlocked = false;
      }
      break;
    }
    case "DRAFT": {
      const draftNode = action.payload.node;
      const parent = findNode(
        draftState.root,
        draftNode.parent!.path === "/" ? draftNode.parent!.path : draftNode.parent!.path.substring(10)
      ) as FNodeOf<"dir">;
      if (!parent) break;
      const existingIdx = parent.children.findIndex((child) => child.id === draftNode.id);
      if (existingIdx >= 0) {
        parent.children.splice(existingIdx, 1, draftNode);
      } else {
        parent.children.push(draftNode);
      }
      draftState.draft = true;
      break;
    }
    case "DRAFT_CANCEL": {
      const draftNode = action.payload.node;
      const parent = findNode(
        draftState.root,
        draftNode.parent!.path === "/" ? draftNode.parent!.path : draftNode.parent!.path.substring(10)
      ) as FNodeOf<"dir">;
      if (!parent) break;
      parent.children.splice(
        parent.children.findIndex((child) => child.id === draftNode.id),
        1
      );
      draftState.draft = false;
      break;
    }
    default:
      break;
  }
};

const coalescer = (events: FSEvent[]) => {
  events.sort((a, b) => a.timestamp - b.timestamp);
  const coalesced: FSCoalescedEvent[] = [];
  const seen = new Set<string>();
  const renameCandidates = new Map<string, FSEvent>();
  const recentCreates = new Map<string, FSEvent>();
  const recentRemoves = new Map<string, FSEvent>();
  const writes = new Map<string, FSEvent>();

  for (const event of events) {
    if (event.action === "rename") {
      renameCandidates.set(event.path, event);
      continue;
    }
    if (event.action === "create") {
      // Rename + Create = Move
      let processed = false;
      for (const [oldPath, renameEvent] of renameCandidates) {
        if (
          event.oldPath &&
          renameCandidates.has(event.oldPath) &&
          Math.abs(event.timestamp - renameEvent.timestamp) < 200 &&
          events.findIndex((e) => e === renameEvent) < events.findIndex((e) => e === event)
        ) {
          const newPath = event.path;
          coalesced.push({
            action: "move",
            data: {
              from: renameEvent.watchedPath,
              to: event.watchedPath,
              oldPath: renameEvent.path,
              newPath: event.path,
              timestamp: event.timestamp,
              type: event.type,
              ino: event.ino,
            },
          });
          renameCandidates.delete(oldPath);
          seen.add(oldPath);
          seen.add(newPath);
          processed = true;
          break;
        }
      }
      if (processed) continue;

      // Remove + Create = Modify
      if (recentRemoves.has(event.path)) {
        const removeEvent = recentRemoves.get(event.path)!;
        if (
          Math.abs(removeEvent.timestamp - event.timestamp) < 200 &&
          events.findIndex((e) => e === removeEvent) < events.findIndex((e) => e === event)
        ) {
          coalesced.push({
            action: "modify",
            data: { ...event, ino: event.ino! },
          });
          recentRemoves.delete(event.path);
          seen.add(event.path);
          continue;
        }
      }

      recentCreates.set(event.path, event);
      continue;
    }
    if (event.action === "remove") {
      // Create + Remove = Ignore
      if (recentCreates.has(event.path)) {
        const createEvent = recentCreates.get(event.path)!;
        if (
          Math.abs(createEvent.timestamp - event.timestamp) < 200 &&
          events.findIndex((e) => e === createEvent) < events.findIndex((e) => e === event)
        ) {
          recentCreates.delete(event.path);
          continue;
        }
      }

      recentRemoves.set(event.path, event);
      continue;
    }
    if (event.action === "write") {
      writes.set(event.path, event);
    }
  }
  for (const [path, writeEvent] of writes) {
    if (!seen.has(path)) {
      coalesced.push({ action: "modify", data: { ...writeEvent, ino: writeEvent.ino! } });
      seen.add(path);
    }
  }
  for (const [path, createEvent] of recentCreates) {
    if (!seen.has(path)) {
      coalesced.push({ action: "create", data: { ...createEvent, ino: createEvent.ino! } });
      seen.add(path);
    }
  }
  for (const [path, removeEvent] of recentRemoves) {
    if (!seen.has(path)) {
      coalesced.push({ action: "remove", data: { ...removeEvent } });
      seen.add(path);
    }
  }
  for (const [oldPath, renameEvent] of renameCandidates) {
    if (!seen.has(oldPath)) {
      coalesced.push({
        action: "move",
        data: { ...renameEvent, from: renameEvent.watchedPath, oldPath: renameEvent.path },
      });
      seen.add(oldPath);
    }
  }
  return coalesced;
};

export const buildIndex = (root: FNode) => {
  const index: Record<string, FNode> = {};

  const walk = (node: FNode, currentPath: string) => {
    index[currentPath] = node;
    if ((node as FNodeOf<"dir">).children) {
      for (const child of (node as FNodeOf<"dir">).children) {
        const childPath = currentPath === "/" ? `/${child.name}` : `${currentPath}/${child.name}`;
        walk(child, childPath);
      }
    }
  };

  walk(root, "/");

  return index;
};

export const findNode = (root: FNode, path: string) => {
  let curr: FNode | undefined = { children: [root], id: -1, isOpen: true, name: "dummy", path: ".", type: "dir" };

  const parts = path === "/" ? [""] : path.split("/");
  for (const part of parts) {
    if (curr.type === "file") return curr;
    curr = curr.children.find((c) => c.name === part);
    if (!curr) return undefined;
  }

  return curr;
};
