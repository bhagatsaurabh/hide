import api from "@/config/axios";
import { socket } from "@/config/socket";
import { InSocketMessage } from "@/models/common";
import { FSOpenDTO } from "@/models/filesystem";
import { uuidv4 as uuid } from "lib0/random.js";

export const open = async (wsUuid: string) => {
  return await api.post<FSOpenDTO[]>(`/env/open`, { uuid: wsUuid });
};
export const openPath = async (wsUuid: string, path: string) =>
  new Promise((res, rej) => {
    const correlationId = uuid();
    const handle = setTimeout(() => rej({ code: "TIMEOUT" }), 5000);
    socket.once("fs", (msg: InSocketMessage<"fs">) => {
      if (msg.payload.correlationId === correlationId) {
        clearTimeout(handle);
        if (msg.payload.error?.code) {
          rej(msg.payload.error);
        } else {
          res(msg.payload);
        }
      }
    });
    socket.emit("msg", { service: "env", action: "fs.open", payload: { uuid: wsUuid, path }, correlationId });
  });
export const closePath = (wsUuid: string, path: string) => {
  socket.emit("msg", { service: "env", action: "fs.close", payload: { uuid: wsUuid, path } });
};
