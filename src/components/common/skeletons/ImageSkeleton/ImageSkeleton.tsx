import classes from "./ImageSkeleton.module.css";
import DefaultImageSVG from "../../../../assets/icons/image.svg?react";
import React from "react";

interface ImageSkeletonProps {
  className: string;
  style?: React.CSSProperties;
}

const ImageSkeleton = ({ className, style = {} }: Partial<ImageSkeletonProps>) => {
  const classNames = [classes["image-skeleton"]];
  if (className) classNames.push(className);

  return (
    <div style={{ ...style }} className={classNames.join(" ")}>
      <DefaultImageSVG />
    </div>
  );
};

export default ImageSkeleton;
