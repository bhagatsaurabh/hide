import { FSEvent } from "@/models/filesystem";
import { getPath } from "@/utils";

interface FTActionMap {
  LOAD: { path: string; nodes: FileNode[]; forceOpen?: boolean };
  UNLOAD: { path: string };
  CLEAR_STALE: unknown;
  BATCH: { events: FSEvent[] };
  RESUME: { path: string };
  BLOCK: { path: string };
}
type FTAction = {
  [K in keyof FTActionMap]: {
    type: K;
    payload: FTActionMap[K];
  };
}[keyof FTActionMap];

interface FileNodeMap {
  file: undefined;
  dir: FileNode[];
}
export type FileNode = {
  [K in keyof FileNodeMap]: {
    name: string;
    type: K;
    id: number;
    parent?: FileNode;
    isOpen?: boolean;
    children: FileNodeMap[K];
  };
}[keyof FileNodeMap];
type PathPair<T> = [T, T | undefined];
export type ExplorerState = {
  root: FileNode;
  pathMap: Map<string, FileNode>;
  stalePaths: PathPair<string>[];
};

interface FSCoalescedEventMap {
  create: { watchedPath: string; path: string; ino: number; timestamp: number; type: "file" | "dir" };
  modify: { watchedPath: string; path: string; ino: number; timestamp: number; type: "file" | "dir" };
  move: {
    from: string;
    to?: string;
    oldPath: string;
    newPath?: string;
    ino?: number;
    timestamp: number;
    type: "file" | "dir";
  };
  remove: { watchedPath: string; path: string; timestamp: number; type: "file" | "dir" };
}
export type FSCoalescedEvent = {
  [K in keyof FSCoalescedEventMap]: {
    action: K;
    data: FSCoalescedEventMap[K];
  };
}[keyof FSCoalescedEventMap];

export function fileTreeReducer(state: ExplorerState, action: FTAction): ExplorerState {
  switch (action.type) {
    case "LOAD": {
      const dirNode = state.pathMap.get(action.payload.path);
      if (!dirNode) return state;

      dirNode.children = action.payload.nodes;
      action.payload.nodes.forEach((node) => {
        if (node.type === "dir") node.children = [];
        node.parent = dirNode;
        state.pathMap.set(`${getPath(dirNode)}/${node.name}`, node);
      });
      if (action.payload.forceOpen) {
        dirNode.isOpen = true;
      }
      return { ...state };
    }
    case "UNLOAD": {
      const dirNode = state.pathMap.get(action.payload.path);
      if (!dirNode) return state;

      const path = getPath(dirNode);
      dirNode.children?.forEach((child) => {
        state.pathMap.delete(`${path}/${child.name}`);
      });
      dirNode.children = [];
      return { ...state };
    }
    case "CLEAR_STALE": {
      if (state.stalePaths.length === 0) return state;
      return { ...state, stalePaths: [] };
    }
    case "BATCH": {
      const events = coalescer(action.payload.events);
      const stalePaths: PathPair<string>[] = [];
      for (const event of events) {
        if (event.action === "create") {
          const dirNode = state.pathMap.get(event.data.watchedPath);
          if (!dirNode) continue;
          const common = {
            id: event.data.ino!,
            name: event.data.path.substring(event.data.path.lastIndexOf("/") + 1),
            parent: dirNode,
          };
          const node = {
            ...common,
            type: event.data.type,
            children: event.data.type === "dir" ? [] : undefined,
          } as FileNode;
          dirNode.children?.push(node);
          state.pathMap.set(`${getPath(dirNode)}/${node.name}`, node);
        } else if (event.action === "move") {
          const oldDirNode = state.pathMap.get(event.data.from);
          let newDirNode: FileNode | undefined;
          if (event.data.to) newDirNode = state.pathMap.get(event.data.to);
          const node = state.pathMap.get(event.data.oldPath);
          if (!node) {
            continue;
          }
          let oldPath, newPath;
          if (oldDirNode) {
            oldPath = getPath(node);
            state.pathMap.delete(oldPath);
            oldDirNode.children!.splice(
              oldDirNode.children!.findIndex((n) => n === node),
              1
            );
          }
          if (newDirNode) {
            console.log(event);
            node.name = event.data.newPath!.substring(event.data.newPath!.lastIndexOf("/") + 1);
            node.parent = newDirNode;
            newDirNode.children?.push(node);
            newPath = getPath(node);
            state.pathMap.set(newPath, node);
          }
          if (node.type === "dir" && node.isOpen) {
            node.children?.forEach((child) => child.type === "dir" && (child.isOpen = false));
            node.isOpen = false;
            stalePaths.push([oldPath!, newPath]);
          }
        } else if (event.action === "modify") {
          // TODO: Notify users with possible integration with yjs & arbitration in-case of conflicts
        } else if (event.action === "remove") {
          // TODO: Notify users with possible integration with yjs & arbitration in-case of conflicts
          const dirNode = state.pathMap.get(event.data.watchedPath);
          const node = state.pathMap.get(event.data.path);
          if (!node) {
            continue;
          }
          if (dirNode) {
            dirNode.children!.splice(
              dirNode.children!.findIndex((n) => n === node),
              1
            );
            state.pathMap.delete(`${getPath(dirNode)}/${node.name}`);
          }
        }
      }
      return { ...state, stalePaths: [...state.stalePaths, ...stalePaths] };
    }
    default:
      return state;
  }
}

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
