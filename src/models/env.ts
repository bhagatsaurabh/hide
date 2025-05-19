import { OutSocketMessagePayload } from "./common";

export type EnvAction = "ping";

export interface OutSocketMessageEnv extends OutSocketMessagePayload {
  uuid: string;
}

export interface EnvPing extends OutSocketMessageEnv {
  uuid: string;
}
