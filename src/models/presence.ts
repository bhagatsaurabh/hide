import { OutSocketMessagePayload } from "./common";

export type PresenceAction = "ping";

export interface OutSocketMessagePresence extends OutSocketMessagePayload {
  uuid: string | "";
}

export type PresencePing = OutSocketMessagePresence;
