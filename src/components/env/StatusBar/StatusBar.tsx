import { useEffect } from "react";
import classes from "./StatusBar.module.css";

const StatusBar = () => {
  return (
    <div className={classes.statusbar}>
      <div className={classes.section}></div>
      <div className={classes.section}></div>
    </div>
  );
};

export default StatusBar;
