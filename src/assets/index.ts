import { InternalNotificationType } from "@/models/notification";
import { FC, SVGProps } from "react";

const icons = import.meta.glob("./icons/*.svg", { eager: true, import: "default", query: "?react" });

const images = import.meta.glob("./images/*.{png,jpg,jpeg,gif,webp}", {
  eager: true,
  import: "default",
});

export const getIcon = (name: string) => {
  return (icons[`./icons/${name}.svg`] ?? icons[`./icons/default.svg`]) as FC<SVGProps<SVGSVGElement>>;
};
export const getImage = (name: string): string => {
  return images[`./images/${name}`] as string;
};

export const DefaultImageSVG = getIcon("image");
export const DefaultSVG = getIcon("default");

const statusIconMap = {
  info: getIcon("info"),
  warning: getIcon("warning"),
  success: getIcon("success"),
  error: getIcon("error"),
  "info-warning": getIcon("info"),
};

export const getStatusIcon = (status: InternalNotificationType) => statusIconMap[status];
