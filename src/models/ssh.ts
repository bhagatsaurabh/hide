import { InSocketMessagePayload } from "./common";
import { OutSocketMessageEnv } from "./env";

export interface SSHError extends InSocketMessagePayload {
  message: string;
}
export interface SSHOpen extends InSocketMessagePayload {
  sessionId: string;
}
export interface SSHOutput extends InSocketMessagePayload {
  sessionId: string;
  output: string;
}
export interface SSHClosed extends InSocketMessagePayload {
  sessionId: string;
}

export type SSHResponseMap = {
  open: SSHOpen;
  output: SSHOutput;
  error: SSHError;
  closed: SSHClosed;
};
export type SSHPayload = {
  [K in keyof SSHResponseMap]: {
    action: K;
    payload: SSHResponseMap[K];
  };
}[keyof SSHResponseMap];

///////

export type SSHAction = "ssh.request" | "ssh.data" | "ssh.close" | "ssh.closeall";

export interface SSHRequest extends OutSocketMessageEnv {
  privateKey: string;
}
export interface SSHData extends OutSocketMessageEnv {
  sessionId: string;
  input: string;
}
export interface SSHClose extends OutSocketMessageEnv {
  sessionId: "#all" | string;
}
