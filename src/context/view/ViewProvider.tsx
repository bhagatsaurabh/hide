import React, { ReactNode, useRef } from "react";
import { createHtmlPortalNode } from "react-reverse-portal";
import { ViewContext } from "./view.context";

interface ViewProviderProps {
  children: ReactNode;
}

export const ViewProvider = ({ children }: ViewProviderProps) => {
  const nodes = useRef(new Map<string, ReturnType<typeof createHtmlPortalNode>>());

  const getNode = (viewId: string) => {
    if (!nodes.current.has(viewId)) {
      nodes.current.set(viewId, createHtmlPortalNode());
    }
    return nodes.current.get(viewId)!;
  };

  return <ViewContext.Provider value={{ getNode }}>{children}</ViewContext.Provider>;
};
