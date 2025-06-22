import { ReactNode } from "react";
import classes from "./Spinner.module.css";

interface SpinnerProps {
  size: number;
  children: ReactNode;
  className: string;
}

const Spinner = ({ size, className, children }: Partial<SpinnerProps>) => {
  size = size ?? 1;
  const classNames = [classes.spinner];
  if (className) {
    classNames.push(className);
  }

  return (
    <>
      <div style={{ width: `${size}rem`, height: `${size}rem` }} className={classNames.join(" ")}>
        <div className={[classes.bar, classes.bar1].join(" ")}></div>
      </div>
      {children && (
        <h4 style={{ fontSize: `${size / 2}rem` }} className={classes["spinner-text"]}>
          {children}
        </h4>
      )}
    </>
  );
};

export default Spinner;
