import Image from "../common/Image/Image";
import classes from "./Features.module.css";

const Features = () => {
  return (
    <>
      <div className={classes.feature}>
        <div className={classes.iconhighlight}>
          <Image
            path="cloud"
            alt="Cloud icon"
            className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 of-contain"
            asset
            icon
          />
        </div>
        <h3 className={classes.heading}>Anytime, anywhere</h3>
        <p>A dev platform that provisions on-demand, disposable containers in the cloud.</p>
      </div>
      <div className={classes.feature}>
        <div className={classes.iconhighlight}>
          <Image path="lock" alt="Lock icon" className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 of-contain" asset icon />
        </div>
        <h3 className={classes.heading}>Secure access</h3>
        <p>Each environment is fully isolated, SSH-accessible, and open only to the members that you add.</p>
      </div>
      <div className={classes.feature}>
        <div className={classes.iconhighlight}>
          <Image
            path="refresh"
            alt="Refresh icon"
            className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 of-contain"
            asset
            icon
          />
        </div>
        <h3 className={classes.heading}>Continue where you left off</h3>
        <p>
          With no need for regular snapshots, your environment stays light, fast and uninterruptible with quick
          resume.
        </p>
      </div>
      <div className={classes.feature}>
        <div className={classes.iconhighlight}>
          <Image
            path="wrench"
            alt="Wrench icon"
            className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 of-contain"
            asset
            icon
          />
        </div>
        <h3 className={classes.heading}>Customizable</h3>
        <p>Start with a predefined template and customize the workspace as per your needs.</p>
      </div>
      <div className={classes.feature}>
        <div className={classes.iconhighlight}>
          <Image
            path="group"
            alt="Group icon"
            className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 of-contain"
            asset
            icon
          />
        </div>
        <h3 className={classes.heading}>Live collaboration</h3>
        <p>Seamlessly invite and manage workspace members, collaborate with upto 10 users in real-time.</p>
      </div>
    </>
  );
};

export default Features;
