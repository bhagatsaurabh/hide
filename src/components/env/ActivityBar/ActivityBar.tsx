import { useEffect } from "react";
import classes from "./ActivityBar.module.css";

const ActivityBar = () => {
  useEffect(() => {
    console.log("Mounted: ActivityBar");
    return () => console.log("Unmounted: ActivityBar");
  }, []);

  return <>ActivityBar</>;
};

export default ActivityBar;
