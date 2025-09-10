import { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";
import classes from "./Button.module.css";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { isText, noop } from "@/utils";
import { Null } from "@/utils/types";

interface ButtonProps {
  busy: boolean;
  disabled: boolean;
  onClick: (e: MouseEvent) => unknown;
  icon: string;
  iconProps: { "data-position"?: "left" | "right"; [key: string]: unknown; color?: string };
  size: number;
  className: string;
  children: ReactNode;
  fit: boolean;
  type: "primary" | "secondary" | "tertiary";
  ref: RefObject<Null<HTMLButtonElement>>;
  highlight: boolean;
  btnType?: "button" | "submit" | "reset";
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: () => void;
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
  ref,
  highlight = false,
  btnType,
  onMouseEnter = noop,
  onMouseLeave = noop,
}: Partial<ButtonProps>) => {
  const classNames = [classes.button, classes[type]];
  if (disabled) classNames.push(classes.disabled);
  if (fit) classNames.push(classes.fit);
  if (className) classNames.push(className);
  if (highlight) classNames.push(classes["highlight"]);
  const content = [];
  const iconClasses = ["va-text-bottom"];

  if (children) {
    content.push(
      isText(children) ? <span style={!fit ? { lineHeight: `${size * 1.5}rem` } : {}}>{children}</span> : children
    );
  }
  if (icon) {
    content.push(
      !busy ? (
        <Icon
          className={iconClasses.join(" ")}
          style={
            children
              ? { [iconProps["data-position"] === "left" ? "marginRight" : "marginLeft"]: `${size * 0.6}rem` }
              : {}
          }
          size={size * 0.8}
          name={icon}
          {...iconProps}
        />
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
      type={btnType}
      ref={ref}
      disabled={disabled}
      className={classNames.join(" ")}
      style={
        {
          fontSize: `${size * 0.8}rem`,
          "--border-radius": `${size * 0.4}rem`,
        } as CSSProperties
      }
      onClick={!disabled ? onClick : noop}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {...content}
    </button>
  );
};

export default Button;
