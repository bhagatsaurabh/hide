import { createContext } from "react";

type Env = { open: (path: string) => Promise<void>; close: (path: string) => void };

export const EnvContext = createContext<Env | undefined>(undefined);
