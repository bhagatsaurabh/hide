import { CSSProperties } from "react";
import classes from "./PointSkeleton.module.css";

interface PointSkeletonProps {
  size: number;
  className: string;
  style: CSSProperties;
}

const PointSkeleton = ({ size = 1, className, style = {} }: Partial<PointSkeletonProps>) => {
  const classNames = [classes["point-skeleton"]];
  if (className) classNames.push(className);

  return <div style={{ width: `${size}rem`, height: `${size}rem`, ...style }} className={classNames.join(" ")}></div>;
};

export default PointSkeleton;
