import { FNode } from "@/reducers/explorer";
import { createContext } from "react";

type Env = {
  open: (fnode: FNode) => Promise<boolean>;
  close: (fnode: FNode) => void;
  save: (fnode: FNode) => void;
};

export const EnvContext = createContext<Env | undefined>(undefined);
