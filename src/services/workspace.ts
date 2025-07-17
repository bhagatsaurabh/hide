import api from "@/config/axios";
import {
  InvitationAcceptDTO,
  InvitationIgnoreDTO,
  ProvisionDTO,
  WorkspaceCreateDTO,
  WorkspaceDTO,
  WorkspaceUpdateDTO,
} from "@/models/workspace";

export const getAllWorkspaces = async () => {
  return await api.get<WorkspaceDTO[]>("/workspace/all");
};

export const createWorkspace = async (data: WorkspaceCreateDTO) => {
  return await api.post<ProvisionDTO>("/provisioner/provision", data);
};

export const updateWorkspace = async (data: WorkspaceUpdateDTO) => {
  return await api.patch("/workspace/update", data);
};

export const acceptInvitation = async (data: InvitationAcceptDTO) => {
  return await api.post("/workspace/accept", data);
};

export const ignoreInvitation = async (data: InvitationIgnoreDTO) => {
  return await api.post("/workspace/ignore", data);
};
