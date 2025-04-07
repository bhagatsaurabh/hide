export interface WorkspaceDTO {
  id: number;
  uuid: string;
  name: string;
  description: string;
  createdAt: string;
  memberships: MembershipDTO[];
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
}
export interface ProvisionDTO {
  message: string;
  privateKey: string;
  workspace: WorkspaceDTO;
}
