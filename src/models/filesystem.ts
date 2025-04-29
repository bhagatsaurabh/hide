import { SocketMessagePayload } from "./common";

export interface FSOpenDTO {
  name: string;
  path: string;
  type: "file" | "dir";
}
export interface FSSyncDTO {
  uid: string;
  path: string;
  action: "add" | "addDir" | "unlink" | "unlinkDir" | "change";
}

export type FSEventType = "create" | "remove" | "rename" | "write";
export type FSEvent = {
  watchedPath: string;
  path: string;
  oldPath?: string;
  ino?: number;
  action: FSEventType;
  timestamp: number;
};

export interface FSBlock extends SocketMessagePayload {
  path: string;
}
export type FSResume = FSBlock;

export interface FSEventBatch extends SocketMessagePayload {
  events: FSEvent[];
}

export interface FSDTO<T extends SocketMessagePayload> {
  uid: string;
  type: string;
  data: T;
}

export interface FileTreeNode extends FSOpenDTO {
  children: FileTreeNode[];
}
