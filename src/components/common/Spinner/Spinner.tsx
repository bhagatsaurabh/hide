import { ReactNode, RefObject, useEffect, useRef } from "react";
import classes from "./Spinner.module.css";

interface SpinnerProps {
  size: number;
  children: ReactNode;
  className: string;
  ref: RefObject<HTMLDivElement | null>;
}

const Spinner = ({ size, className, children, ref }: Partial<SpinnerProps>) => {
  size = size ?? 1;
  const classNames = [classes.spinner, "type-spinner"];
  if (className) {
    classNames.push(className);
  }
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    textRef.current?.style.setProperty("--size", `${size / 2}rem`);
  }, [ref, size]);

  return (
    <>
      <div ref={ref} style={{ width: `${size}rem`, height: `${size}rem` }} className={classNames.join(" ")}>
        <div className={[classes.bar, classes.bar1].join(" ")}></div>
      </div>
      {children && (
        <h4 ref={textRef} className={classes["spinner-text"]}>
          {children}
        </h4>
      )}
    </>
  );
};

export default Spinner;
