import classes from "./WorkspaceTypeInfo.module.css";

const WorkspaceTypeInfo = () => {
  return (
    <div className={classes.info}>
      <h3 className={classes.title}>Dedicated workspaces</h3>
      <ul className={classes.infolist}>
        <li>Guaranteed reservation for a limited lease of 2 days</li>
        <li>Requires access</li>
        <li>Can be restored on priority</li>
        <li>Gets cleand-up when lease expires</li>
      </ul>
      <h3 className={classes.title}>Spot workspaces</h3>
      <ul className={classes.infolist}>
        <li>Unlimited and unreserved lease</li>
        <li>Can only be deleted by you</li>
        <li>May not always restore based on available capacity</li>
        <li>Will shutdown anytime to reclaim resources</li>
      </ul>
      <p className="mt-2 mb-0">
        Request for getting an access code and try out the platform on a dedicated workspace for up to 2 days.
        <br />
      </p>
      <p className="mt-1 mb-0 fs-0p8">
        Having issues ? Contact{" "}
        <a href={`mailto:${import.meta.env.VITE_HIDE_SUPPORT_MAIL}`}>
          {`<${import.meta.env.VITE_HIDE_SUPPORT_MAIL}>`}
        </a>{" "}
        for any queries.
      </p>
    </div>
  );
};

export default WorkspaceTypeInfo;
