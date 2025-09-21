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
  path?: string;
}

const Icon = ({
  path,
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (path) return;
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
  }, [fs, name, path]);
  useEffect(() => {
    if (!path) return;
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
  }, [name, path]);

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
  if ((!Component && !path) || (path && !isLoaded)) {
    return <PointSkeleton className={className} style={style} size={size} />;
  }
  return (
    <>
      {Component && (
        <Component
          className={[className, status ? classes[name] : ""].join(" ")}
          width={`${size}rem`}
          height={`${size}rem`}
          style={{ fill: color, stroke: color, strokeWidth, ...style }}
        />
      )}
      {!Component && isLoaded && (
        <span
          dangerouslySetInnerHTML={{ __html: svg }}
          className={[className, status ? classes[name] : ""].join(" ")}
          style={{ fill: color, stroke: color, strokeWidth, ...style, width: `${size}rem`, height: `${size}rem` }}
        />
      )}
    </>
  );
};

export default Icon;
