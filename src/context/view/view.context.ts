import { createContext } from "react";
import { createHtmlPortalNode } from "react-reverse-portal";

type ViewContextType = {
  getNode(viewId: string): ReturnType<typeof createHtmlPortalNode>;
};

export const ViewContext = createContext<ViewContextType | null>(null);
