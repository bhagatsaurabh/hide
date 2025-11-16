export type Null<T> = T | null;
export type Undefined<T> = T | undefined;
export enum State {
  INIT,
  PENDING,
  ERROR,
  SUCCESS,
}
export type ServerError = {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
};
