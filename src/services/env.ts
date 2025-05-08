import api from "@/config/axios";
import { FSOpenDTO } from "@/models/filesystem";

export const openDir = async (wsUuid: string, path: string) => {
  return await api.get<FSOpenDTO[]>(`/workspace-${wsUuid}/dir/open`, {
    params: {
      path,
    },
  });
};
export const closeDir = async (wsUuid: string, path: string) => {
  return await api.post<FSOpenDTO[]>(`/workspace-${wsUuid}/dir/close`, { path });
};

export const openFile = async (wsUuid: string, path: string) => {
  return await api.post<string>(`/workspace-${wsUuid}/file/open`, { path });
};
export const closeFile = async (wsUuid: string, path: string) => {
  return await api.post<void>(`/workspace-${wsUuid}/file/close`, { path });
};
