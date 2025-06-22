import { ReactNode } from "react";
import Icon from "../Icon/Icon";
import classes from "./Link.module.css";

interface LinkProps {
  icon?: string;
  iconProps?: { size?: number };
  to: string;
  children?: ReactNode;
  className?: string;
}

const Link = ({ icon, iconProps = {}, to, children, className }: LinkProps) => {
  const classNames = [classes.link];

  if (className) classNames.push(className);

  return (
    <a className={classNames.join(" ")} href={to} target="_blank">
      {icon && <Icon name={icon} size={iconProps.size || 1} />}
      {children}
    </a>
  );
};

export default Link;
