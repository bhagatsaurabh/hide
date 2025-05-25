import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";
import { NotificationBar } from "@/components/NotificationBar/NotificationBar";

export const Home = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => dispatch(signOut());
  const handleDashboard = () => navigate("/dashboard");

  return (
    <>
      <div>{"Home"}</div>
      <Link to="/features">Features</Link>
      <NotificationBar />
      <br />
      {authStatus === AuthStatus.SIGNED_OUT && <Link to="/auth">Sign In</Link>}
      {authStatus === AuthStatus.SIGNED_IN && (
        <>
          <button onClick={handleSignOut}>Sign Out</button>
          <button onClick={handleDashboard}>Dashboard</button>
        </>
      )}
      {authStatus === AuthStatus.PENDING && <span>...</span>}
    </>
  );
};
