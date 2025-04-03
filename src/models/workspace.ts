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
}

export interface WorkspaceCreateDTO {
  name: string;
  description: string;
}
