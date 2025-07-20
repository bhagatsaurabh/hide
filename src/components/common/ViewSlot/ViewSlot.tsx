import { OutPortal } from "react-reverse-portal";
import { useContext } from "react";
import { ViewContext } from "@/context/view/view.context";

interface ViewSlotProps {
  viewId: string;
}

export const ViewSlot = ({ viewId }: ViewSlotProps) => {
  const { getNode } = useContext(ViewContext)!;
  const node = getNode(viewId);
  return <OutPortal node={node} />;
};
