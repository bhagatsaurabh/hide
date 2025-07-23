import { useEffect } from "react";
import classes from "./ActivityBar.module.css";
import Button from "@/components/common/Button/Button";
import Icon from "@/components/common/Icon/Icon";

const ActivityBar = () => {
  return (
    <div className={classes.activitybar}>
      <div className={classes.upper}>
        <button>
          <Icon name="burger" size={1.75} />
        </button>
        <button>
          <Icon name="files" size={1.7} />
        </button>
      </div>
      <div className={classes.lower}></div>
    </div>
  );
};

export default ActivityBar;
