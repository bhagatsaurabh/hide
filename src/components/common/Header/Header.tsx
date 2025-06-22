import { ReactNode, useEffect, useRef, useState } from "react";
import classes from "./Header.module.css";

interface HeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  bodyRef: HTMLElement | null;
}

const Header = ({ left, center, right, bodyRef }: HeaderProps) => {
  const [shadow, setShadow] = useState(false);
  const classNames = [classes.header];
  const observer = useRef<IntersectionObserver>(null);

  if (shadow) classNames.push(classes.shadow);

  useEffect(() => {
    if (!bodyRef) return;

    observer.current = new IntersectionObserver(([entry]) => setShadow(!entry.isIntersecting), {
      root: null,
      threshold: 0,
    });
    observer.current.observe(bodyRef);
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
