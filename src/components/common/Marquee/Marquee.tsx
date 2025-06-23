import React, { CSSProperties } from "react";
import classes from "./Marquee.module.css";

interface MarqueeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FC<any>;
  props: Record<string, unknown>[];
  height: number;
  className?: string;
  spacing?: number;
}

const Marquee = ({ Component, props, height, className, spacing = 1 }: MarqueeProps) => {
  return (
    <div
      style={{ height: `${height}rem`, "--no-of-items": props.length, "--spacing": spacing } as CSSProperties}
      className={[classes.marquee, className ?? ""].join(" ")}
    >
      {props.map((prop, idx) => (
        <Component style={{ "--item-pos": idx + 1 }} key={idx} {...prop} />
      ))}
    </div>
  );
};

export default Marquee;
