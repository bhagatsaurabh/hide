import classNames from "classnames";
import Button from "../common/Button/Button";
import Logo from "../common/Logo/Logo";
import classes from "./EnvAbout.module.css";

interface EnvAboutProps {
  close: () => void;
}
const EnvAbout = ({ close }: EnvAboutProps) => {
  return (
    <div className={classes.about}>
      <div className={classes.abheader}>
        <Logo size={1.5} />
        <Button className="float-right p-0p5" icon="close" iconProps={{ asset: true }} fit onClick={close} />
      </div>
      <div className={classes.abcontent}>
        <div className={classes.abinfo}>
          <div className={classes.abtitle}></div>
          <div className={classes.abvalues}>
            <div>
              <span className={classes.key}>Version:&nbsp;</span>
              <span className={classes.value}>
                {document.querySelector('head meta[name="version"]')?.getAttribute("content")}
              </span>
            </div>
            <div>
              <span className={classes.key}>Date:&nbsp;</span>
              <span className={classes.value}>
                {document.querySelector('head meta[name="builddate"]')?.getAttribute("content")}
              </span>
            </div>
            <div>
              <span className={classes.key}>Platform:&nbsp;</span>
              <span className={classNames([classes.value, classes.platform])}>{navigator.userAgent}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.abactions}>
        <Button
          type="secondary"
          size={1}
          onClick={() => window.open("https://github.com/bhagatsaurabh/hide/issues", "_blank")}
        >
          Report Bug
        </Button>
        <Button type="secondary" size={1} onClick={close}>
          OK
        </Button>
      </div>
    </div>
  );
};

export default EnvAbout;
