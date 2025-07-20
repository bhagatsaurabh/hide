import { useEffect } from "react";
import classes from "./StatusBar.module.css";

const StatusBar = () => {
  useEffect(() => {
    console.log("Mounted: StatusBar");
    return () => console.log("Unmounted: StatusBar");
  }, []);

  return <>StatusBar</>;
};

export default StatusBar;
