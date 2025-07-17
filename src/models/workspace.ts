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
  role: "owner" | "member";
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
export interface WorkspaceUpdateDTO {
  id: number;
  name: string;
  description: string;
  members?: string[];
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

export type InvitationAcceptDTO = {
  id: string;
  token: string;
};
export type InvitationIgnoreDTO = {
  id: string;
  token: string;
};

export interface WorkspaceMembersModified extends InSocketMessagePayload {
  uuid: string;
}

export type WorkspaceResponseMap = {
  "members.modified": WorkspaceMembersModified;
};
export type WorkspacePayload = {
  [K in keyof WorkspaceResponseMap]: {
    action: K;
    payload: WorkspaceResponseMap[K];
  };
}[keyof WorkspaceResponseMap];
