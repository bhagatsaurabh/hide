import { FSPayload } from "./filesystem";
import { NotificationPayload } from "./notification";
import { SSHPayload } from "./ssh";

export type InSocketMessageActionMap = {
  ssh: SSHPayload;
  fs: FSPayload;
  notification: NotificationPayload;
};
export type InSocketMessagePayload = {
  [key: string]: unknown;
};

export type InSocketMessage<K extends keyof InSocketMessageActionMap> = InSocketMessageActionMap[K];
