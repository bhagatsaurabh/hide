import { InSocketMessagePayload } from "./common";
import { OutSocketMessageEnv } from "./env";

export interface FSOpenDTO {
  name: string;
  path: string;
  type: "file" | "dir";
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
export interface FSSync extends InSocketMessagePayload {
  uuid: string;
  path: string;
  buf: string;
}

export type FSResponseMap = {
  batch: FSEventBatch;
  block: FSBlock;
  resume: FSResume;
  sync: FSSync;
};
export type FSPayload = {
  [K in keyof FSResponseMap]: {
    action: K;
    payload: FSResponseMap[K];
  };
}[keyof FSResponseMap];

////////

export type FSAction = "fs.sync" | "fs.close";

export interface FSSyncOut extends OutSocketMessageEnv {
  path: string;
  buf: string;
}

export interface FSClose extends OutSocketMessageEnv {
  path: string;
}
