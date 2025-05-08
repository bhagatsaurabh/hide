import { createContext } from "react";

type Env = {
  open: (path: string, isDir: boolean) => Promise<void>;
  close: (path: string, isDir: boolean) => void;
};

export const EnvContext = createContext<Env | undefined>(undefined);
