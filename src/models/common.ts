import { EnvPayload, EnvPing, OutSocketMessageEnv } from "./env";
import { FSClose, FSOpen, FSPayload, FSSyncOut } from "./filesystem";
import { NotificationPayload } from "./notification";
import { OutSocketMessagePresence, PresencePing } from "./presence";
import { SSHClose, SSHData, SSHPayload, SSHRequest } from "./ssh";

export type InSocketMessageActionMap = {
  ssh: SSHPayload;
  fs: FSPayload;
  notification: NotificationPayload;
  env: EnvPayload;
};
export type InSocketMessagePayload = {
  correlationId?: string;
  error?: { code: string };
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
