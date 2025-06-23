import classes from "./Usecases.module.css";

const Usecases = () => {
  return (
    <>
      <h1 className={classes.heading}>Ideal for quick testing, prototyping & more</h1>
      <div className={classes.list}>
        <div className={classes.usecase}>
          <h2>Onboarding and collaboration</h2>
          <p>
            Edit code together in real-time with built-in multi-user support. Every change is synced instantly,
            enabling seamless pair programming, code reviews, and onboarding without switching tools.
          </p>
        </div>
        <div className={classes.usecase}>
          <h2>Experimentation</h2>
          <p>
            Break things freely. Each workspace runs in an ephemeral container that's always auto-saved — perfect for
            testing libraries, debugging, or learning without the hassle of local setup.
          </p>
        </div>
        <div className={classes.usecase}>
          <h2>CI and testing</h2>
          <p>
            Spin up fresh containers for every build, test run or pull request. Seamless integration with your CI
            using a simple API.
          </p>
        </div>
      </div>
    </>
  );
};

export default Usecases;
