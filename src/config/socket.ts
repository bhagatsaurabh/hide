import { io, Socket } from "socket.io-client";

import { auth } from "./firebase";
import { InSocketMessage, OutSocketMessage } from "@/models/common";

export type InSocketEventsMap = {
  ssh: (msg: InSocketMessage<"ssh">) => void;
  fs: (msg: InSocketMessage<"fs">) => void;
  notification: (msg: InSocketMessage<"notification">) => void;
  env: (msg: InSocketMessage<"env">) => void;
} & {
  [key: string]: (msg: InSocketMessage<string>) => void;
};
export interface OutSocketEventsMap {
  msg: (msg: OutSocketMessage) => void;
}
export type TypedSocket = Socket<InSocketEventsMap, OutSocketEventsMap>;
let socket: TypedSocket;

const getAuth = (token: string) => ({
  token,
  sessionId: sessionStorage.getItem("sessionId"),
});
export const connectSocket = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Cannot get token");
  }

  return new Promise<TypedSocket>((resolve, reject) => {
    try {
      socket = io(import.meta.env.VITE_HIDE_WS_SERVER, { auth: (cb) => cb(getAuth(token)) });

      socket.on("connect", () => {
        resolve(socket);
      });
      socket.io.on("error", (err) => reject(err));
      socket.io.on("close", (err) => {
        console.log("Closed: ", err);
      });
      socket.io.on("reconnect", (attempt: number) => {
        console.log("Reconnect: ", attempt, socket?.id);
      });
      socket.io.on("reconnect_attempt", (attempt: number) => {
        console.log("Reconnect Attempt: ", attempt, socket?.id);
      });
      socket.io.on("reconnect_error", (err) => {
        console.log("Reconnect Error: ", socket?.id, err);
      });
      socket.io.on("reconnect_failed", () => {
        console.log("Reconnect Failed: ", socket?.id);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export { socket };
