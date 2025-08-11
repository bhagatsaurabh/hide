import { InSocketMessagePayload, OutSocketMessagePayload } from "./common";
import { CommandMap } from "./context-menu";

export type EnvAction = "ping";

export interface OutSocketMessageEnv extends OutSocketMessagePayload {
  uuid: string;
}

export interface EnvPing extends OutSocketMessageEnv {
  uuid: string;
}

export interface WSRun extends OutSocketMessageEnv {
  command: keyof CommandMap;
  ctx: unknown;
}

////////////

export interface EnvDisconnect extends InSocketMessagePayload {
  code: string;
}
export interface EnvError extends InSocketMessagePayload {
  code: string;
}
export interface EnvAwareness extends InSocketMessagePayload {
  uids: string[];
}

export type EnvResponseMap = {
  disconnect: EnvDisconnect;
  error: EnvError;
  awareness: EnvAwareness;
};
export type EnvPayload = {
  [K in keyof EnvResponseMap]: {
    action: K;
    payload: EnvResponseMap[K];
  };
}[keyof EnvResponseMap];

export interface EnvOpenDTO {
  uuid: string;
  sessionId: string;
}
export interface EnvCloseDTO {
  uuid: string;
  sessionId: string;
}
