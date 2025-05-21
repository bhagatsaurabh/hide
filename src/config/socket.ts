import { io, Socket } from "socket.io-client";

import { auth } from "./firebase";
import { InSocketMessage, OutSocketMessage } from "@/models/common";

export interface InSocketEventsMap {
  ssh: (msg: InSocketMessage<"ssh">) => void;
  fs: (msg: InSocketMessage<"fs">) => void;
  notification: (msg: InSocketMessage<"notification">) => void;
}
export interface OutSocketEventsMap {
  msg: (msg: OutSocketMessage) => void;
}
export type TypedSocket = Socket<InSocketEventsMap, OutSocketEventsMap>;
let socket: TypedSocket;
let socketId: string | undefined;

const getAuth = (token: string) => ({
  token,
  previousId: socketId,
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
        socketId = socket.id;
        resolve(socket);
      });
      socket.io.on("error", (err) => reject(err));
      socket.io.on("close", () => {});
      socket.io.on("reconnect", (_attempt: number) => {
        console.log("Reconnect: ", socket?.id);
      });
      socket.io.on("reconnect_attempt", (attempt: number) => {
        console.log("Reconnect Attempt: ", attempt, socket?.id);
      });
      socket.io.on("reconnect_error", (_err) => {
        console.log("Reconnect Error: ", socket?.id);
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
