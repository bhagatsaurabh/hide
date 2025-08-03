import { FNodeOf } from "@/models/filesystem";
import { WorkspaceDTO } from "@/models/workspace";
import { createContext } from "react";
import { createHtmlPortalNode } from "react-reverse-portal";

type ViewContextType = {
  getNode(viewId: string): ReturnType<typeof createHtmlPortalNode>;
  workspace: WorkspaceDTO;
  loadFile: (fnode: FNodeOf<"file">) => void;
  closeFile: (fnode: FNodeOf<"file">) => void;
};

export const ViewContext = createContext<ViewContextType | null>(null);
