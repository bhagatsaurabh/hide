export type SocketMessagePayload<T = string> = {
  [k: string]: unknown;
  action: T;
};

export type SocketMessage<T extends SocketMessagePayload> = {
  type: string;
  uid: string;
  data: T;
};
