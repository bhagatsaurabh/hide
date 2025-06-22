import classes from "./PointSkeleton.module.css";

interface PointSkeletonProps {
  size: number;
  className: string;
}

const PointSkeleton = ({ size = 1, className }: Partial<PointSkeletonProps>) => {
  const classNames = [classes["point-skeleton"]];
  if (className) classNames.push(className);

  return <div style={{ width: `${size}rem`, height: `${size}rem` }} className={classNames.join(" ")}></div>;
};

export default PointSkeleton;
