import api from "@/config/axios";
import { FSOpenDTO } from "@/models/filesystem";

export const openDir = async (wsUuid: string, path: string) => {
  return await api.get<FSOpenDTO[]>(`/workspace-${wsUuid}/dir/open`, {
    params: {
      path,
    },
  });
};
