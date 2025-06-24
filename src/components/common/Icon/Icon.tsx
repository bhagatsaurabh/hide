import { useEffect, useState } from "react";
import PointSkeleton from "../skeletons/PointSkeleton/PointSkeleton";
import DefaultSVG from "../../../assets/icons/default.svg?react";

interface IconProps {
  size?: number;
  name: string;
  className?: string;
  color?: string;
}

const Icon = ({ size = 1, name, className, color }: IconProps) => {
  const [Component, setComponent] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import(`../../../assets/icons/${name}.svg?react`)
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default);
          setError(false);
        }
      })
      .catch(() => {
        setComponent(null);
        setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [name]);

  if (error) {
    return (
      <DefaultSVG
        className={className}
        width={`${size}rem`}
        height={`${size}rem`}
        style={{ fill: color, stroke: color }}
      />
    );
  }
  if (!Component) {
    return <PointSkeleton className={className} size={size} />;
  }
  return (
    <Component
      className={className}
      width={`${size}rem`}
      height={`${size}rem`}
      style={{ fill: color, stroke: color }}
    />
  );
};

export default Icon;
