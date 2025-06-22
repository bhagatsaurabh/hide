import { ReactNode } from "react";
import classes from "./Footer.module.css";

interface FooterProps {
  children?: ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  const classeNames = [classes.footer];

  return <footer className={classeNames.join(" ")}>{children}</footer>;
};

export default Footer;
