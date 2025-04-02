export type Null<T> = T | null;
export type Undefined<T> = T | undefined;
export enum State {
  INIT,
  PENDING,
  ERROR,
  SUCCESS,
}
