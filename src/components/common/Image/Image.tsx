import { useEffect, useState } from "react";
import classes from "./Image.module.css";
import DefaultSVG from "../../../assets/icons/default.svg?react";
import ImageSkeleton from "../skeletons/ImageSkeleton/ImageSkeleton";

interface ImageProps {
  path: string;
  alt: string;
  asset?: boolean;
  className?: string;
  size?: number;
}

const Image = ({ path, alt, asset = false, className, size = 3 }: ImageProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const classNames = [classes.image, className ?? ""];

  useEffect(() => {
    if (!asset) return;
    let isMounted = true;
    import(path)
      .then((module) => {
        if (isMounted) {
          setSrc(() => module.default);
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

  if (error) {
    return <DefaultSVG className={className} width={`${size}rem`} style={{ fill: "beige", stroke: "beige" }} />;
  }
  if (!src) {
    return <ImageSkeleton className={className} size={size} />;
  }

  return asset ? (
    <img className={classNames.join(" ")} style={{ width: `${size}rem` }} src={src} alt={alt} />
  ) : (
    <img
      className={classNames.join(" ")}
      style={{ width: `${size}rem` }}
      src={path}
      alt={alt}
      onLoad={() => setSrc("#")}
    />
  );
};

export default Image;
