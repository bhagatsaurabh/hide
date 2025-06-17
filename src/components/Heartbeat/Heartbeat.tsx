import { useEffect } from "react";
import { socket } from "@/config/socket";
import { useAppSelector } from "@/hooks/store";
import { OutSocketMessage } from "@/models/common";
import { selectActiveUuid } from "@/store/env";
import { selectConnected } from "@/store/workspace";

export const Heartbeat = () => {
  const connected = useAppSelector(selectConnected);
  const uuid = useAppSelector(selectActiveUuid);

  useEffect(() => {
    let handle = -1;
    if (connected) {
      const msg: OutSocketMessage = { service: "presence", action: "session.ping", payload: { uuid } };
      handle = setInterval(() => {
        socket.emit("msg", msg);
      }, 6000) as unknown as number;
    }

    return () => clearInterval(handle);
  }, [connected, uuid]);

  return <></>;
};
