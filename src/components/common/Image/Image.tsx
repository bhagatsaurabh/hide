import React, { useState } from "react";
import classes from "./Image.module.css";
import ImageSkeleton from "../skeletons/ImageSkeleton/ImageSkeleton";
import { getIcon, getImage } from "@/assets";

export interface ImageProps {
  path: string;
  alt: string;
  asset?: boolean;
  icon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Image = ({ path, alt, asset = false, className, icon = false, style = {} }: ImageProps) => {
  const Svg = asset && icon ? getIcon(path) : null;
  let src = asset && !icon ? getImage(path) : "";
  if (!asset) {
    src = path;
  }
  const [isLoaded, setIsLoaded] = useState(asset && !icon);
  const classNames = [classes.image, className ?? ""];

  let cover;
  if (!asset && !isLoaded) {
    cover = <ImageSkeleton className={className} style={{ ...style }} />;
  }

  const assetImage = Svg ? <Svg style={{ ...style }} className={classNames.join(" ")} /> : null;

  const image = (
    <img
      style={{ ...style, display: isLoaded ? "block" : "none" }}
      className={classNames.join(" ")}
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
    />
  );

  return (
    <>
      {cover}
      {asset ? assetImage : image}
    </>
  );
};

export default Image;
