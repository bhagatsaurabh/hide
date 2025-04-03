import api from "@/config/axios";
import { ProvisionDTO, WorkspaceCreateDTO, WorkspaceDTO } from "@/models/workspace";

export const getAllWorkspaces = async () => {
  return await api.get<WorkspaceDTO[]>("/workspace/all");
};

export const createWorkspace = async (data: WorkspaceCreateDTO) => {
  return await api.post<ProvisionDTO>("/provisioner/new", data);
};
