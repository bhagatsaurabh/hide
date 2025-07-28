import { CSSProperties, useEffect, useState } from "react";
import PointSkeleton from "../skeletons/PointSkeleton/PointSkeleton";
import DefaultSVG from "../../../assets/icons/default.svg?react";
import classes from "./Icon.module.css";

interface IconProps {
  size?: number;
  name: string;
  className?: string;
  color?: string;
  status?: boolean;
  style?: CSSProperties;
  strokeWidth?: number;
  fs?: boolean;
}

const Icon = ({
  strokeWidth = 1,
  size = 1,
  name,
  className,
  color,
  status = false,
  style = {},
  fs = false,
}: IconProps) => {
  const [Component, setComponent] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let promise;
    if (fs) {
      promise = import(`../../../assets/icons/editor/${name}.svg?react`);
    } else {
      promise = import(`../../../assets/icons/${name}.svg?react`);
    }
    promise
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default);
          setError(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setComponent(null);
        setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [fs, name]);

  if (error) {
    return (
      <DefaultSVG
        className={className}
        width={`${size}rem`}
        height={`${size}rem`}
        style={{ fill: color, stroke: color, ...style }}
      />
    );
  }
  if (!Component) {
    return <PointSkeleton className={className} style={style} size={size} />;
  }
  return (
    <Component
      className={[className, status ? classes[name] : ""].join(" ")}
      width={`${size}rem`}
      height={`${size}rem`}
      style={{ fill: color, stroke: color, strokeWidth, ...style }}
    />
  );
};

export default Icon;
