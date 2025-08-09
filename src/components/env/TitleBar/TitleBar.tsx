import { CSSProperties, useContext } from "react";
import classes from "./TitleBar.module.css";
import Logo from "@/components/common/Logo/Logo";
import { ViewContext } from "@/context/view/view.context";
import Image from "@/components/common/Image/Image";

const TitleBar = () => {
  const { workspace, awareness } = useContext(ViewContext)!;

  return (
    <div className={classes.titlebar}>
      <div className={classes.logo}>
        <Logo size={0.6} light />
      </div>
      <div className={classes.title}>{workspace.name}</div>
      <div className={classes.online}>
        {awareness.map((onlineUser) => (
          <div
            className={classes.wrapper}
            style={{ "--accentColor": onlineUser.color.default } as CSSProperties}
            key={onlineUser.profile.userId}
          >
            <Image
              path={onlineUser.profile.picture || "../../../assets/icons/guest.svg"}
              alt="member avatar"
              asset={!onlineUser.profile.picture}
              className="w-1p15 h-1p15 of-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TitleBar;
