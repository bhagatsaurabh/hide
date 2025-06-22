import { CSSProperties, ReactNode } from "react";
import classes from "./Button.module.css";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { noop } from "@/utils";

interface ButtonProps {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: string;
  iconPosition: "left" | "right";
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
  iconPosition = "left",
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
    content.push(<span style={{ lineHeight: `${size * 1.5}rem` }}>{children}</span>);
    iconClasses.push(iconPosition === "left" ? "mr-1" : "ml-1");
  }
  if (icon) {
    content.push(
      !busy ? (
        <Icon className={iconClasses.join(" ")} size={size} name={icon} />
      ) : (
        <Spinner className={iconClasses.join(" ")} size={size} />
      )
    );

    if (iconPosition === "left") {
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
