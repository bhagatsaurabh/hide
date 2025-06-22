import classes from "./ImageSkeleton.module.css";
import DefaultImageSVG from "../../../../assets/icons/image.svg?react";

interface ImageSkeletonProps {
  className: string;
  size: number;
}

const ImageSkeleton = ({ className, size = 3 }: Partial<ImageSkeletonProps>) => {
  const classNames = [classes["image-skeleton"]];
  if (className) classNames.push(className);

  return <DefaultImageSVG style={{ width: `${size}rem` }} className={classNames.join(" ")} />;
};

export default ImageSkeleton;
