import { Link } from "react-router";

export const Home = () => {
  return (
    <>
      <div>{"Home"}</div>
      <Link to="/features">Features</Link>
      <br />
      <Link to="/auth">Sign In</Link>
    </>
  );
};
