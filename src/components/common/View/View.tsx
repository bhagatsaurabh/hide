import { ViewContext } from "@/context/view/view.context";
import { useContext } from "react";
import { InPortal } from "react-reverse-portal";

export const View: React.FC<{ viewId: string; children: React.ReactNode }> = ({ viewId, children }) => {
  const { getNode } = useContext(ViewContext)!;
  const node = getNode(viewId);
  return <InPortal node={node}>{children}</InPortal>;
};
