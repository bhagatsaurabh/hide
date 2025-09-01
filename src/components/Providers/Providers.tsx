import { useNavigate } from "react-router";
import Button from "../common/Button/Button";
import classes from "./Providers.module.css";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, AuthType, selectStatus, signIn } from "@/store/auth";
import Spinner from "../common/Spinner/Spinner";
import { useState } from "react";

const Providers = () => {
  const navigate = useNavigate();
  const authStatus = useAppSelector(selectStatus);
  const [pendingProvider, setPendingProvider] = useState<AuthType | null>(null);
  const dispatch = useAppDispatch();

  const handleNavigate = (signInType: AuthType) => {
    navigate("/auth/signin", { state: { signInType } });
  };
  const handleClick = async (provider: AuthType) => {
    setPendingProvider(provider);
    await dispatch(signIn({ type: provider })).unwrap();
    setPendingProvider(null);
  };

  if (authStatus === AuthStatus.INCOMPLETE_PROFILE) {
    return <Spinner size={2.5} />;
  }

  return (
    <div className={classes.wrapper}>
      <section className={classes.heading}>Sign in to get started</section>
      <section className={classes.providers}>
        <div className={classes.list}>
          <Button
            className="px-1 py-0p5"
            icon="guest"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleNavigate(AuthType.GUEST)}
          >
            <span className="fw-300">Guest</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            icon="email"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleNavigate(AuthType.EMAIL)}
          >
            <span className="fw-300">Email</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            busy={pendingProvider === AuthType.GITHUB}
            icon="github"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick(AuthType.GITHUB)}
          >
            <span className="fw-300">GitHub</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            busy={pendingProvider === AuthType.GOOGLE}
            icon="google"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick(AuthType.GOOGLE)}
          >
            <span className="fw-300">Google</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            busy={pendingProvider === AuthType.MICROSOFT}
            icon="microsoft"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick(AuthType.MICROSOFT)}
          >
            <span className="fw-300">Microsoft</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Providers;
