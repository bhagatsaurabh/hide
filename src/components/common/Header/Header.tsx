import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import classes from "./Header.module.css";

interface HeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  bodyRef: RefObject<HTMLElement | null>;
}

const Header = ({ left, center, right, bodyRef }: HeaderProps) => {
  const [shadow, setShadow] = useState(false);
  const classNames = [classes.header];
  const observer = useRef<IntersectionObserver>(null);

  if (shadow) classNames.push(classes.shadow);

  useEffect(() => {
    if (!bodyRef.current) return;

    observer.current?.disconnect();
    setShadow(false);

    const cssdec = getComputedStyle(document.documentElement);
    const baseFontSize = parseFloat(cssdec.fontSize);
    const headerHeight = parseFloat(cssdec.getPropertyValue("--header-height"));

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setShadow(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 1,
        rootMargin: `-${(headerHeight * baseFontSize) / 2}px 0px 0px 0px`,
      }
    );
    observer.current.observe(bodyRef.current);
  }, [bodyRef]);

  useEffect(() => () => observer.current?.disconnect(), []);

  return (
    <header className={classNames.join(" ")}>
      <div className={classes.left}>{left}</div>
      <div className={classes.center}>{center}</div>
      <div className={classes.right}>{right}</div>
    </header>
  );
};

export default Header;
