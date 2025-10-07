import { ReactNode } from "react";
import classes from "./InfoBox.module.css";
import { getStatusIcon } from "@/assets";

interface InfoBoxProps {
  children: ReactNode;
  type: "info" | "info-warning" | "warning" | "success" | "error";
  className?: string;
}

const InfoBox = ({ children, type, className }: InfoBoxProps) => {
  const StatusIcon = getStatusIcon(type);

  return (
    <aside className={[classes.infobox, className ?? ""].join(" ")}>
      <StatusIcon className={[classes.icon, classes[type]].join(" ")} />
      {children}
    </aside>
  );
};

export default InfoBox;
