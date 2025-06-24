import { useNavigate } from "react-router";
import Button from "../common/Button/Button";
import classes from "./Providers.module.css";
import { motion } from "motion/react";

const Providers = () => {
  const navigate = useNavigate();

  const handleClick = (signInType: string) => {
    navigate("/auth/signin", { state: { signInType } });
  };

  return (
    <div>
      <section className={classes.heading}>Sign in to get started</section>
      <section className={classes.providers}>
        <div className={classes.list}>
          <Button icon="guest" size={1.25} type="secondary" onClick={() => handleClick("guest")}>
            Guest
          </Button>
          <Button icon="email" size={1.25} type="secondary" onClick={() => handleClick("email")}>
            Email
          </Button>
          <Button icon="github" size={1.25} type="secondary" onClick={() => handleClick("github")}>
            GitHub
          </Button>
          <Button icon="google" size={1.25} type="secondary" onClick={() => handleClick("google")}>
            Google
          </Button>
          <Button icon="microsoft" size={1.25} type="secondary" onClick={() => handleClick("microsoft")}>
            Microsoft
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Providers;
