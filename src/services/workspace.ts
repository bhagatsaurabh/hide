import api from "@/config/axios";
import { ProvisionDTO, WorkspaceCreateDTO, WorkspaceDTO, WorkspaceUpdateDTO } from "@/models/workspace";

export const getAllWorkspaces = async () => {
  return await api.get<WorkspaceDTO[]>("/workspace/all");
};

export const createWorkspace = async (data: WorkspaceCreateDTO) => {
  return await api.post<ProvisionDTO>("/provisioner/provision", data);
};

export const updateWorkspace = async (data: WorkspaceUpdateDTO) => {
  return await api.patch("/workspace/update", data);
};
