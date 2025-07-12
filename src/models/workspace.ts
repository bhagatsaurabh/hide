import { InSocketMessagePayload } from "./common";

export interface WorkspaceDTO {
  id: number;
  uuid: string;
  name: string;
  description: string;
  createdAt: string;
  memberships: MembershipDTO[];
  image: string;
}

export interface MembershipDTO {
  workspaceId: number;
  userId: string;
  role: string;
  joinedAt: string;
  name: string;
  username: string;
  picture: string;
}

export interface WorkspaceCreateDTO {
  name: string;
  description: string;
  image: string;
  uid: string;
  sessionId: string;
}
export interface ProvisionDTO {
  message: string;
  privateKey: string;
  workspace: WorkspaceDTO;
}

export interface ProvisionStatus extends InSocketMessagePayload {
  message: string;
}
export interface ProvisionError extends InSocketMessagePayload {
  message: string;
}
export interface ProvisionSuccess extends InSocketMessagePayload {
  message: string;
  privateKey: string;
  workspace: WorkspaceDTO;
}

export type ProvisionResponseMap = {
  status: ProvisionStatus;
  error: ProvisionError;
  success: ProvisionSuccess;
};
export type ProvisionPayload = {
  [K in keyof ProvisionResponseMap]: {
    action: K;
    payload: ProvisionResponseMap[K];
  };
}[keyof ProvisionResponseMap];
