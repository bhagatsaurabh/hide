import { useEffect } from "react";
import classes from "./TerminalGroup.module.css";

const TerminalGroup = () => {
  useEffect(() => {
    console.log("Mounted: TerminalGroup");
    return () => console.log("Unmounted: TerminalGroup");
  }, []);

  return <>TerminalGroup</>;
};

export default TerminalGroup;
