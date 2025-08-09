import { FNodeOf } from "@/models/filesystem";
import { MembershipDTO, WorkspaceDTO } from "@/models/workspace";
import { createContext } from "react";
import { createHtmlPortalNode } from "react-reverse-portal";

type ViewContextType = {
  getNode(viewId: string): ReturnType<typeof createHtmlPortalNode>;
  workspace: WorkspaceDTO;
  awareness: { profile: MembershipDTO; color: { default: string; transparent: string } }[];
  loadFile: (fnode: FNodeOf<"file">) => void;
  closeFile: (fnode: FNodeOf<"file">) => void;
};

export const ViewContext = createContext<ViewContextType | null>(null);
