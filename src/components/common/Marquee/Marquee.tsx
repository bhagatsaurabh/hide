import { ReactNode } from "react";
import classes from "./Marquee.module.css";

interface MarqueeProps {
  elements: ReactNode[];
}

const Marquee = ({ elements }: MarqueeProps) => {
  return <div className={classes.marquee}>{...elements}</div>;
};

export default Marquee;
