import { useEffect } from "react";
import classes from "./TabGroup.module.css";

const TabGroup = () => {
  useEffect(() => {
    console.log("Mounted: TabGroup");
    return () => console.log("Unmounted: TabGroup");
  }, []);

  return <>TabGroup</>;
};

export default TabGroup;
