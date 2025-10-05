import classNames from "classnames";
import classes from "./Toggle.module.css";

interface ToggleProps {
  on: boolean;
  onchange: (val: boolean) => void;
  className?: string;
}
const Toggle = ({ on, onchange, className = "" }: ToggleProps) => {
  return (
    <button
      role="switch"
      className={classNames([classes.toggle, on ? classes.on : "", className])}
      onClick={() => onchange(!on)}
    ></button>
  );
};

export default Toggle;
