import { InSocketMessagePayload, OutSocketMessagePayload } from "./common";

export type EnvAction = "ping";

export interface OutSocketMessageEnv extends OutSocketMessagePayload {
  uuid: string;
}

export interface EnvPing extends OutSocketMessageEnv {
  uuid: string;
}

////////////

export type EnvWorkspaceOpened = InSocketMessagePayload;
export type EnvWorkspaceOpenWait = InSocketMessagePayload;
export type EnvSessionLost = InSocketMessagePayload;
export interface EnvError extends InSocketMessagePayload {
  code: string;
}

export type EnvResponseMap = {
  "session.lost": EnvSessionLost;
  "workspace.opened": EnvWorkspaceOpened;
  "workspace.open.wait": EnvWorkspaceOpenWait;
  error: EnvError;
};
export type EnvPayload = {
  [K in keyof EnvResponseMap]: {
    action: K;
    payload: EnvResponseMap[K];
  };
}[keyof EnvResponseMap];
