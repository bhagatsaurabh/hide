/* eslint-disable no-async-promise-executor */
import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";

let socket: Socket;

export const connectSocket = async () => {
  return new Promise<Socket>(async (resolve, reject) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Cannot get token");
      }

      socket = io(import.meta.env.VITE_HIDE_WS_SERVER, {
        auth: {
          token,
        },
      });

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
