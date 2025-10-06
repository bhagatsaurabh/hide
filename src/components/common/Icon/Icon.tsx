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
  statusClass?: string;
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
  statusClass = "",
  style = {},
  fs = false,
}: IconProps) => {
  const [Component, setComponent] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (fs) return;
    let isMounted = true;
    const promise = import(`../../../assets/icons/${name}.svg?react`);
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
  }, [name, fs]);
  useEffect(() => {
    if (!fs) return;
    const loadSvg = async () => {
      try {
        const data = await (await fetch(`/icons/editor/${name}.svg`)).text();
        setIsLoaded(true);
        setSvg(data);
      } catch (error) {
        console.log(error);
        setError(true);
      }
    };
    loadSvg();
  }, [name, fs]);

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
  if ((!Component && !fs) || (fs && !isLoaded)) {
    return <PointSkeleton className={className} style={style} size={size} />;
  }
  return (
    <>
      {Component && (
        <Component
          className={[className, status ? classes[name] : "", classes[statusClass]].join(" ")}
          width={`${size}rem`}
          height={`${size}rem`}
          style={{ fill: color, stroke: color, strokeWidth, ...style }}
        />
      )}
      {!Component && isLoaded && (
        <span
          dangerouslySetInnerHTML={{ __html: svg }}
          className={[className, status ? classes[name] : "", classes[statusClass]].join(" ")}
          style={{ fill: color, stroke: color, strokeWidth, ...style, width: `${size}rem`, height: `${size}rem` }}
        />
      )}
    </>
  );
};

export default Icon;
