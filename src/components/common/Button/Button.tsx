import { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";
import classes from "./Button.module.css";
import Icon, { IconProps } from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import { isText, noop } from "@/utils";
import { Null } from "@/utils/types";

interface ButtonProps {
  busy?: boolean;
  disabled: boolean;
  onClick: (e: MouseEvent) => unknown;
  icon: string;
  iconProps: Partial<IconProps> & { "data-position"?: "left" | "right" };
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
  busy = false,
  disabled,
  onClick,
  icon,
  iconProps = {},
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
  const iconClasses = ["va-text-bottom"];
  const _iconProps = { asset: true, "data-position": "left", ...iconProps };

  let contentText;
  if (children) {
    contentText =
      !icon && busy ? (
        <Spinner key="spinner" className={iconClasses.join(" ")} size={size} />
      ) : isText(children) ? (
        <span style={!fit ? { lineHeight: `${size * 1.25}rem` } : {}}>{children}</span>
      ) : (
        children
      );
  }
  let contentIcon;
  if (icon) {
    contentIcon = !busy ? (
      <Icon
        key="icon"
        className={iconClasses.join(" ")}
        style={
          children
            ? { [_iconProps["data-position"] === "left" ? "marginRight" : "marginLeft"]: `${size * 0.6}rem` }
            : {}
        }
        size={size * 0.8}
        name={icon}
        {..._iconProps}
      />
    ) : (
      <Spinner key="spinner" className={iconClasses.join(" ")} size={size} />
    );
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
      {_iconProps["data-position"] === "left" ? (
        <>
          {contentIcon}
          {contentText}
        </>
      ) : (
        <>
          {contentText}
          {contentIcon}
        </>
      )}
    </button>
  );
};

export default Button;
