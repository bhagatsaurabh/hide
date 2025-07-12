import { CSSProperties } from "react";
import classes from "./CardSkeleton.module.css";

interface CardSkeletonProps {
  className: string;
  style: CSSProperties;
}

const CardSkeleton = ({ className, style }: Partial<CardSkeletonProps>) => {
  const classNames = [classes["card-skeleton"]];
  if (className) classNames.push(className);

  return (
    <div style={style} className={classes["card-skeleton"]}>
      <div className={classes.circle}></div>
      <div className={classes.lines}>
        <div className={classes.line}></div>
        <div className={classes.line}></div>
        <div className={classes.line}></div>
      </div>
    </div>
  );
};

export default CardSkeleton;
