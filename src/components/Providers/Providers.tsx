import { useNavigate } from "react-router";
import Button from "../common/Button/Button";
import classes from "./Providers.module.css";
import { useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import Spinner from "../common/Spinner/Spinner";
import { ProviderType } from "../SignIn/SignIn";

const Providers = () => {
  const navigate = useNavigate();
  const authStatus = useAppSelector(selectStatus);

  const handleNavigate = (signInType: ProviderType) => {
    navigate("/auth/signin", { state: { signInType } });
  };
  const handleClick = (provider: string) => {
    // TODO
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
            onClick={() => handleNavigate("guest")}
          >
            <span className="fw-300">Guest</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            icon="email"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleNavigate("email")}
          >
            <span className="fw-300">Email</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            icon="github"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick("github")}
          >
            <span className="fw-300">GitHub</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            icon="google"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick("google")}
          >
            <span className="fw-300">Google</span>
          </Button>
          <Button
            className="px-1 py-0p5"
            icon="microsoft"
            iconProps={{ size: 1.35, "data-position": "left" }}
            size={1.25}
            type="secondary"
            onClick={() => handleClick("microsoft")}
          >
            <span className="fw-300">Microsoft</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Providers;
