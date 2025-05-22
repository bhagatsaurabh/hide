import { EnvPing, OutSocketMessageEnv } from "./env";
import { FSClose, FSPayload, FSSyncOut } from "./filesystem";
import { NotificationPayload } from "./notification";
import { OutSocketMessagePresence, PresencePing } from "./presence";
import { SSHClose, SSHCloseAll, SSHData, SSHPayload, SSHRequest } from "./ssh";

export type InSocketMessageActionMap = {
  ssh: SSHPayload;
  fs: FSPayload;
  notification: NotificationPayload;
};
export type InSocketMessagePayload = {
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
    "ssh.closeall": SSHCloseAll;
    "fs.sync": FSSyncOut;
    "fs.close": FSClose;
    ping: EnvPing;
  };
  presence: {
    ping: PresencePing;
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
