export type SocketMessagePayload<T = string> = {
  action: T;
  [k: string]: unknown;
};

export type SocketMessage<T extends SocketMessagePayload> = {
  type: string;
  uid: string;
  data: T;
};
