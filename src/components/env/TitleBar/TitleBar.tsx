import { useContext } from "react";
import classes from "./TitleBar.module.css";
import Logo from "@/components/common/Logo/Logo";
import { ViewContext } from "@/context/view/view.context";

const TitleBar = () => {
  const { workspace } = useContext(ViewContext)!;

  return (
    <div className={classes.titlebar}>
      <div className={classes.logo}>
        <Logo size={0.6} light />
      </div>
      <div className={classes.title}>{workspace.name}</div>
      <div className={classes.online}>Online Members</div>
    </div>
  );
};

export default TitleBar;
