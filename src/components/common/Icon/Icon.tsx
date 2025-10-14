import { CSSProperties, useEffect, useState } from "react";
import classes from "./Icon.module.css";
import PointSkeleton from "../skeletons/PointSkeleton/PointSkeleton";
import { DefaultSVG, getIcon } from "@/assets";

export interface IconProps {
  name: string;
  prefix?: string;
  asset?: boolean;
  size?: number;
  color?: string;
  status?: boolean;
  statusClass?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
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
  prefix = "",
  asset,
}: IconProps) => {
  const Svg = asset ? getIcon(`${prefix ? prefix + "/" : ""}${name}`) : null;
  const [svgSrc, setSvgSrc] = useState("");
  const [isLoaded, setIsLoaded] = useState(asset ? true : false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (asset) return;

    const loadSvg = async () => {
      try {
        const data = await (await fetch(`/icons/${prefix ? prefix + "/" : ""}${name}.svg`)).text();
        setIsLoaded(true);
        setSvgSrc(data);
      } catch (error) {
        console.log(error);
        setError(true);
      }
    };
    loadSvg();
  }, [asset, name, prefix]);

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
  if (!asset && !isLoaded) {
    return <PointSkeleton className={className} style={style} size={size} />;
  }
  return (
    <>
      {Svg && (
        <Svg
          className={[className, status ? classes[name] : "", classes[statusClass]].join(" ")}
          width={`${size}rem`}
          height={`${size}rem`}
          style={{ fill: color, stroke: color, strokeWidth, ...style }}
        />
      )}
      {!asset && isLoaded && (
        <span
          dangerouslySetInnerHTML={{ __html: svgSrc }}
          className={["fs-0", classes.wrapper, className, status ? classes[name] : "", classes[statusClass]].join(
            " "
          )}
          style={
            {
              fill: color,
              stroke: color,
              strokeWidth,
              ...style,
              "--width": `${size}rem`,
              "--height": `${size}rem`,
            } as CSSProperties
          }
        />
      )}
    </>
  );
};

export default Icon;
