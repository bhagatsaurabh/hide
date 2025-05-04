import { SocketMessagePayload } from "./common";

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
  type: "dir" | "file";
};

export type FSPayload<A = "block" | "resume" | "batch"> = SocketMessagePayload<A>;
export interface FSBlock extends FSPayload<"block"> {
  path: string;
}
export interface FSResume extends FSPayload<"resume"> {
  path: string;
}
export interface FSEventBatch extends FSPayload<"batch"> {
  events: FSEvent[];
}

export interface FSDTO<T extends SocketMessagePayload> {
  uid: string;
  type: string;
  data: T;
}
