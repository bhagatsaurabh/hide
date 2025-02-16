import { Link } from "react-router";
import AuthListener from "@/components/AuthListener/AuthListener";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";

export const Home = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();

  const handleSignOut = () => dispatch(signOut());

  return (
    <>
      <AuthListener />
      <div>{"Home"}</div>
      <Link to="/features">Features</Link>
      <br />
      {authStatus === AuthStatus.SIGNED_OUT && <Link to="/auth">Sign In</Link>}
      {authStatus === AuthStatus.SIGNED_IN && <button onClick={handleSignOut}>Sign Out</button>}
      {authStatus === AuthStatus.PENDING && <span>...</span>}
    </>
  );
};
