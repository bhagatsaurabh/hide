import { WorkspaceDTO } from "@/models/workspace";
import { createContext } from "react";
import { createHtmlPortalNode } from "react-reverse-portal";

type ViewContextType = {
  getNode(viewId: string): ReturnType<typeof createHtmlPortalNode>;
  workspace: WorkspaceDTO;
};

export const ViewContext = createContext<ViewContextType | null>(null);
