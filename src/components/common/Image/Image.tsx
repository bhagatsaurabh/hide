import React, { useEffect, useState } from "react";
import classes from "./Image.module.css";
import DefaultSVG from "../../../assets/icons/default.svg?react";
import ImageSkeleton from "../skeletons/ImageSkeleton/ImageSkeleton";

interface ImageProps {
  path: string;
  alt: string;
  asset?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Image = ({ path, alt, asset = false, className, style = {} }: ImageProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [Svg, setSvg] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);
  const [error, setError] = useState(false);
  const classNames = [classes.image, className ?? ""];

  useEffect(() => {
    if (!asset) return;
    let isMounted = true;
    const importPath = path.endsWith(".svg") ? path + "?react" : path;
    import(importPath)
      .then((module) => {
        if (isMounted) {
          if (importPath.endsWith("?react")) {
            setSvg(() => module.default);
          } else {
            setSrc(() => module.default);
          }
          setError(false);
        }
      })
      .catch(() => {
        setSrc(null);
        setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [asset, path]);

  let image;
  if (error) {
    image = <DefaultSVG className={className} style={{ fill: "beige", stroke: "beige", ...style }} />;
  }
  if (!src && !Svg) {
    image = <ImageSkeleton className={className} style={{ ...style }} />;
  }

  return (
    image ??
    (asset ? (
      Svg ? (
        <Svg style={{ ...style }} className={classNames.join(" ")} />
      ) : (
        <img style={{ ...style }} className={classNames.join(" ")} src={src!} alt={alt} />
      )
    ) : (
      <img style={{ ...style }} className={classNames.join(" ")} src={path} alt={alt} onLoad={() => setSrc("#")} />
    ))
  );
};

export default Image;
