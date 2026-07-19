export type ServerStatus = "running" | "stopping" | "stopped" | "starting";

export interface ActivationResponse {
  status: ServerStatus;
}
