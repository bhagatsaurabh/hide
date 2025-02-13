import { Link } from "react-router";

export const Features = () => {
  return (
    <>
      <div>{"Features"}</div>
      <Link to="/">Home</Link>
      <br />
      <Link to="/auth">Sign In</Link>
    </>
  );
};
