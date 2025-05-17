import { InSocketMessagePayload } from "./common";

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
