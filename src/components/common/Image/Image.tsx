import React, { useEffect, useState } from "react";
import classes from "./Image.module.css";
import DefaultSVG from "../../../assets/icons/default.svg?react";
import ImageSkeleton from "../skeletons/ImageSkeleton/ImageSkeleton";

export interface ImageProps {
  path: string;
  alt: string;
  asset?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Image = ({ path, alt, asset = false, className, style = {} }: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [Svg, setSvg] = useState<React.FC<React.SVGProps<SVGSVGElement>> | null>(null);
  const [error, setError] = useState(false);
  const classNames = [classes.image, className ?? ""];

  useEffect(() => {
    if (!asset) return;
    let isMounted = true;
    const importPath = path.endsWith(".svg") ? path + "?react" : path;
    import(/* @vite-ignore */ importPath)
      .then((module) => {
        if (isMounted) {
          if (importPath.endsWith("?react")) {
            setSvg(() => module.default);
          } else {
            setIsLoaded(true);
          }
          setError(false);
        }
      })
      .catch(() => {
        setIsLoaded(false);
        setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [asset, path]);

  let cover;
  if (error) {
    cover = <DefaultSVG className={className} style={{ fill: "beige", stroke: "beige", ...style }} />;
  }
  if (!isLoaded && !Svg) {
    cover = <ImageSkeleton className={className} style={{ ...style }} />;
  }

  const assetImage = Svg ? (
    <Svg style={{ ...style }} className={classNames.join(" ")} />
  ) : (
    <img style={{ ...style }} className={classNames.join(" ")} src={path} alt={alt} />
  );

  const nonAssetImage = (
    <img
      style={{ ...style, display: isLoaded ? "block" : "none" }}
      className={classNames.join(" ")}
      src={path}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
    />
  );

  return (
    <>
      {cover}
      {asset ? assetImage : nonAssetImage}
    </>
  );
};

export default Image;
