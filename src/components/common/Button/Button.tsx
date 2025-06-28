import { CSSProperties, MouseEvent, ReactNode } from "react";
import classes from "./Button.module.css";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { isText, noop } from "@/utils";

interface ButtonProps {
  busy: boolean;
  disabled: boolean;
  onClick: (e: MouseEvent) => unknown;
  icon: string;
  iconProps: { "data-position": "left" | "right"; [key: string]: unknown };
  size: number;
  className: string;
  children: ReactNode;
  fit: boolean;
  type: "primary" | "secondary";
}

const Button = ({
  busy,
  disabled,
  onClick,
  icon,
  iconProps = { "data-position": "left" },
  size = 1,
  className,
  children,
  fit,
  type = "primary",
}: Partial<ButtonProps>) => {
  const classNames = [classes.button, classes[type]];
  if (disabled) classNames.push(classes.disabled);
  if (fit) classNames.push(classes.fit);
  if (className) classNames.push(className);
  const content = [];
  const iconClasses = ["va-text-bottom"];

  if (children) {
    content.push(isText(children) ? <span style={{ lineHeight: `${size * 1.5}rem` }}>{children}</span> : children);
    iconClasses.push(iconProps["data-position"] === "left" ? "mr-1" : "ml-1");
  }
  if (icon) {
    content.push(
      !busy ? (
        <Icon className={iconClasses.join(" ")} size={size} name={icon} {...iconProps} />
      ) : (
        <Spinner className={iconClasses.join(" ")} size={size} />
      )
    );

    if (iconProps["data-position"] === "left") {
      [content[0], content[1]] = [content[1], content[0]];
    }
  }

  return (
    <button
      disabled={disabled}
      className={classNames.join(" ")}
      style={{ fontSize: `${size * 0.8}rem`, "--border-radius": `${size * 0.4}rem` } as CSSProperties}
      onClick={!disabled ? onClick : noop}
    >
      {...content}
    </button>
  );
};

export default Button;
