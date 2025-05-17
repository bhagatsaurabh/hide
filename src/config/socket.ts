import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";

import { auth } from "./firebase";
import { InSocketMessage } from "@/models/common";

export interface InSocketEventsMap {
  ssh: (msg: InSocketMessage<"ssh">) => void;
  fs: (msg: InSocketMessage<"fs">) => void;
  notification: (msg: InSocketMessage<"notification">) => void;
}
type TypedSocket = Socket<InSocketEventsMap, DefaultEventsMap>;
let socket: TypedSocket;

export const connectSocket = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Cannot get token");
  }

  return new Promise<TypedSocket>((resolve, reject) => {
    try {
      socket = io(import.meta.env.VITE_HIDE_WS_SERVER, { auth: { token } });

      socket.io.on("error", (err) => reject(err));
      socket.io.on("open", () => resolve(socket));
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
