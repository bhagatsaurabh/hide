import { ReactNode } from "react";
import classes from "./InfoBox.module.css";
import info from "@/assets/icons/info.svg?react";
import warning from "@/assets/icons/warning.svg?react";
import success from "@/assets/icons/success.svg?react";
import error from "@/assets/icons/error.svg?react";

interface InfoBoxProps {
  children: ReactNode;
  type: "info" | "info-warning" | "warning" | "success" | "error";
  className?: string;
}

const iconMap = {
  info,
  warning,
  success,
  error,
  "info-warning": info,
};

const InfoBox = ({ children, type, className }: InfoBoxProps) => {
  const Icon = iconMap[type];

  return (
    <aside className={[classes.infobox, className ?? ""].join(" ")}>
      <Icon className={[classes.icon, classes[type]].join(" ")} />
      {children}
    </aside>
  );
};

export default InfoBox;
