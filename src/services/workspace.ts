import api from "@/config/axios";
import { WorkspaceDTO } from "@/models/workspace";

export const getAllWorkspaces = async () => {
  return await api.get<WorkspaceDTO[]>("/workspace/all");
};
