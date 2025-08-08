import { EnvPayload, OutSocketMessageEnv } from "./env";
import { FSClose, FSDirEntries, FSFile, FSNoop, FSOpen, FSOpenAck, FSPayload, FSSyncOut } from "./filesystem";
import { NotificationPayload } from "./notification";
import { OutSocketMessagePresence, PresencePing } from "./presence";
import { SSHClose, SSHData, SSHPayload, SSHRequest } from "./ssh";
import { ProvisionPayload, WorkspacePayload } from "./workspace";

export type InSocketMessageActionMap = {
  ssh: SSHPayload;
  fs: FSPayload;
  notification: NotificationPayload;
  env: EnvPayload;
  provision: ProvisionPayload;
  workspace: WorkspacePayload;
} & {
  [key: string]: { action: "success" | "error"; payload: FSDirEntries | FSFile | FSNoop | InSocketMessagePayload };
};
export type InSocketMessagePayloadError = { code: string };
export type InSocketMessagePayload = {
  correlationId?: string;
  error?: InSocketMessagePayloadError;
  [key: string]: unknown;
};

export type InSocketMessage<K extends keyof InSocketMessageActionMap> = InSocketMessageActionMap[K];

/////////////////

export type OutSocketMessagePayload = Record<string, unknown>;
export type OutSocketMessagePayloadActionMap = {
  env: OutSocketMessageEnv;
  presence: OutSocketMessagePresence;
};
export type EnforcedOutSocketMessagePayloadActionMap<
  T extends {
    [K in keyof OutSocketMessagePayloadActionMap]: {
      [Sub in string]: OutSocketMessagePayloadActionMap[K];
    };
  }
> = T;
export type OutSocketMessagePayloadMap = EnforcedOutSocketMessagePayloadActionMap<{
  env: {
    "ssh.request": SSHRequest;
    "ssh.data": SSHData;
    "ssh.close": SSHClose;
    "fs.open": FSOpen;
    "fs.open.ack": FSOpenAck;
    "fs.sync": FSSyncOut;
    "fs.close": FSClose;
    // ping: EnvPing;
  };
  presence: {
    "session.ping": PresencePing;
  };
}>;

export type OutSocketMessageMap<
  T extends keyof OutSocketMessagePayloadMap = keyof OutSocketMessagePayloadMap,
  S extends keyof OutSocketMessagePayloadMap[T] = keyof OutSocketMessagePayloadMap[T]
> = {
  service: T;
  action: S;
  payload: OutSocketMessagePayloadMap[T][S];
};

export type OutSocketMessage = {
  [T in keyof OutSocketMessagePayloadMap]: {
    [S in keyof OutSocketMessagePayloadMap[T]]: {
      service: T;
      action: S;
      payload: OutSocketMessagePayloadMap[T][S];
      correlationId?: string;
    };
  }[keyof OutSocketMessagePayloadMap[T]];
}[keyof OutSocketMessagePayloadMap];
