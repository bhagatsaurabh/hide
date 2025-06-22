import classes from "./Logo.module.css";

interface LogoProps {
  light: boolean;
  size: number;
}

const Logo = ({ light, size }: Partial<LogoProps>) => {
  const classNames = [classes.logoname];
  size = size || 1;
  if (light) {
    classNames.push(classes.light);
  }
  return (
    <a href="/">
      <span style={{ fontSize: `${size}rem` }} className={classNames.join(" ")}>
        // H-IDE
      </span>
    </a>
  );
};

export default Logo;
