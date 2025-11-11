import Button from "../Button/Button";
import Link from "../Link/Link";
import classes from "./CrashBoard.module.css";

const CrashBoard = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className={classes.crashboard}>
      <h2>Something went wrong</h2>
      <br />
      <div className={classes.actions}>
        <Link icon="bug" to={import.meta.env.VITE_HIDE_LINK_ISSUES} iconProps={{ asset: true }}>
          Report
        </Link>
        <Button icon="refresh" className="px-0p5 py-0p25" type="secondary" onClick={handleReload}>
          Reload
        </Button>
      </div>
    </div>
  );
};

export default CrashBoard;
