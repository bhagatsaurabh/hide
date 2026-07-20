export type ServerStatus = "running" | "stopping" | "stopped" | "starting";

export interface ActivationResponse {
  id: string;
  state: ServerStatus;
}
