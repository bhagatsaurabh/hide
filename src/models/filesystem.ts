import { InSocketMessagePayload } from "./common";
import { OutSocketMessageEnv } from "./env";

export interface FSOpenDTO {
  name: string;
  path: string;
  isDir: boolean;
  id: number;
}

export type FSEventType = "create" | "remove" | "rename" | "write";
export type FSEvent = {
  watchedPath: string;
  path: string;
  oldPath?: string;
  ino?: number;
  action: FSEventType;
  timestamp: number;
  type: "file" | "dir";
};

export interface FSEventBatch extends InSocketMessagePayload {
  events: FSEvent[];
}
export interface FSBlock extends InSocketMessagePayload {
  path: string;
}
export type FSResume = FSBlock;
export type FSLost = FSBlock;
export interface FSSync extends InSocketMessagePayload {
  uuid: string;
  ino: number;
  buf: string;
}
export interface FSFileDisplaced extends InSocketMessagePayload {
  ino: number;
  uuid: string;
}
export interface FSDirEntries extends InSocketMessagePayload {
  entries: FSOpenDTO[];
}
export interface FSFile extends InSocketMessagePayload {
  content: string;
}
export interface FSDirEntries extends InSocketMessagePayload {
  entries: FSOpenDTO[];
}
export interface FSFile extends InSocketMessagePayload {
  content: string;
}
export type FSNoop = InSocketMessagePayload;

export type FSResponseMap = {
  batch: FSEventBatch;
  block: FSBlock;
  resume: FSResume;
  sync: FSSync;
  lost: FSLost;
  displaced: FSFileDisplaced;
};
export type FSPayload = {
  [K in keyof FSResponseMap]: {
    action: K;
    payload: FSResponseMap[K];
  };
}[keyof FSResponseMap];

////////

export type FSAction = "fs.open" | "fs.sync" | "fs.close";

export interface FSOpen extends OutSocketMessageEnv {
  path: string;
}
export interface FSOpenAck extends OutSocketMessageEnv {
  ino: number;
}
export interface FSSyncOut extends OutSocketMessageEnv {
  ino: number;
  buf: string;
}
export interface FSClose extends OutSocketMessageEnv {
  path: string;
  ino?: number;
}

//////////////////

export interface FSCoalescedCreateEvent {
  watchedPath: string;
  path: string;
  ino: number;
  timestamp: number;
  type: "file" | "dir";
}
export interface FSCoalescedModifyEvent {
  watchedPath: string;
  path: string;
  ino: number;
  timestamp: number;
  type: "file" | "dir";
}
export interface FSCoalescedRemoveEvent {
  watchedPath: string;
  path: string;
  timestamp: number;
  type: "file" | "dir";
}
interface FSCoalescedEventMap {
  create: FSCoalescedCreateEvent;
  modify: FSCoalescedModifyEvent;
  move: {
    from: string;
    to?: string;
    oldPath: string;
    newPath?: string;
    ino?: number;
    timestamp: number;
    type: "file" | "dir";
  };
  remove: FSCoalescedRemoveEvent;
}
export type FSCoalescedEvent = {
  [K in keyof FSCoalescedEventMap]: {
    action: K;
    data: FSCoalescedEventMap[K];
  };
}[keyof FSCoalescedEventMap];

interface FTActionMap {
  _INDEX: { root: FNode };
  LOAD: { path: string; nodes: FNode[]; forceOpen?: boolean };
  UNLOAD: { path: string; forceClose?: boolean };
  OPEN_FILE: { path: string };
  CLOSE_FILE: { path: string };
  CLEAR_STALE: unknown;
  BATCH: { events: FSEvent[] };
  RESUME: { path: string };
  BLOCK: { path: string };
  DRAFT: { node: FNode };
  DRAFT_CANCEL: { node: FNode };
  DRAFT_SAVE: { node: FNode };
}
export type FTAction = {
  [K in keyof FTActionMap]: {
    type: K;
    payload: FTActionMap[K];
  };
}[keyof FTActionMap];

type FNodeMap = {
  file: {
    isDirty?: boolean;
    parent: FNodeOf<"dir">;
  };
  dir: {
    children: FNode[];
    parent?: FNodeOf<"dir">;
  };
};
export type FNode = {
  [K in keyof FNodeMap]: {
    name: string;
    path: string;
    type: K;
    id: number;
    isOpen: boolean;
    isDraft?: boolean;
    isBlocked?: boolean;
  } & FNodeMap[K];
}[keyof FNodeMap];
export type FNodeOf<T extends keyof FNodeMap> = Extract<FNode, { type: T }>;
