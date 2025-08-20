import api from "@/config/axios";
import { socket } from "@/config/socket";
import { InSocketMessage, InSocketMessagePayload } from "@/models/common";
import { CommandMap } from "@/models/context-menu";
import { EnvCloseDTO, EnvOpenDTO } from "@/models/env";
import { WorkspaceWaitDTO } from "@/models/workspace";
import { uuidv4 as uuid } from "lib0/random.js";

export const open = async (data: EnvOpenDTO) => {
  return await api.post<WorkspaceWaitDTO>(`/env/open`, data);
};
export const close = async (data: EnvCloseDTO) => {
  return await api.post<WorkspaceWaitDTO>(`/env/close`, data);
};
export const openPath = async <T extends InSocketMessagePayload>(wsUuid: string, path: string) =>
  new Promise<T>((res, rej) => {
    const correlationId = uuid();
    const handler = (msg: InSocketMessage<string>) => {
      clearTimeout(handle);
      if (msg.action === "error") rej(msg.payload.error);
      else res(msg.payload as T);
    };
    const handle = setTimeout(() => rej({ code: "TIMEOUT" }), 5000);
    socket.once(correlationId, handler);
    socket.emit("msg", {
      service: "env",
      action: "fs.open",
      payload: { uuid: wsUuid, path },
      correlationId,
    });
  });
export const closePath = (wsUuid: string, path: string, ino?: number) => {
  socket.emit("msg", { service: "env", action: "fs.close", payload: { uuid: wsUuid, path, ino } });
};
export const runCommand = async <K extends keyof CommandMap>(
  wsUuid: string,
  command: K,
  ctx: Parameters<CommandMap[K]>[0]
) =>
  new Promise<void>((res, rej) => {
    const correlationId = uuid();
    const handler = (msg: InSocketMessage<string>) => {
      clearTimeout(handle);
      if (msg.action === "error") rej(msg.payload.error);
      else res();
    };
    const handle = setTimeout(() => rej({ code: "TIMEOUT" }), 5000);
    socket.once(correlationId, handler);
    socket.emit("msg", {
      service: "env",
      action: "ws.run",
      payload: { uuid: wsUuid, command, ctx },
      correlationId,
    });
  });
