import api from "@/config/axios";
import { socket } from "@/config/socket";
import { InSocketMessage, InSocketMessagePayload } from "@/models/common";
import { EnvCloseDTO, EnvOpenDTO } from "@/models/env";
import { uuidv4 as uuid } from "lib0/random.js";

export const open = async (data: EnvOpenDTO) => {
  await api.post<unknown, unknown, EnvOpenDTO>(`/env/open`, data);
};
export const close = async (data: EnvCloseDTO) => {
  await api.post<unknown, unknown, EnvCloseDTO>(`/env/close`, data);
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
export const closePath = (wsUuid: string, path: string) => {
  socket.emit("msg", { service: "env", action: "fs.close", payload: { uuid: wsUuid, path } });
};
