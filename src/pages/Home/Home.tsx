import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus, signOut } from "@/store/auth";
import { NotificationBar } from "@/components/Notifications/Notifications";
import Header from "@/components/common/Header/Header";
import Footer from "@/components/common/Footer/Footer";
import Logo from "@/components/common/Logo/Logo";
import { useRef } from "react";
import NavMenu from "@/components/NavMenu/NavMenu";
import classes from "./Home.module.css";
import Link from "@/components/common/Link/Link";
import Button from "@/components/common/Button/Button";
import Marquee from "@/components/common/Marquee/Marquee";
import Image from "@/components/common/Image/Image";

export const Home = () => {
  const authStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => dispatch(signOut());
  const handleDashboard = () => navigate("/dashboard");
  const bodyRef = useRef<HTMLElement>(null);

  return (
    <>
      <Header
        left={<Logo />}
        right={
          <>
            <NotificationBar />
            <NavMenu />
          </>
        }
        bodyRef={bodyRef.current}
      ></Header>
      <main ref={bodyRef}>
        <section className={classes.section}>
          <p className={[classes.heading, "mb-n0p5"].join(" ")}>Cloud</p>
          <p className={[classes.heading, "fw-500"].join(" ")}>Workspaces</p>
          <p className={[classes.heading, "fs-1p75"].join(" ")}>That. Just. Work.</p>
          <p className={classes.subheading}>
            Provision full-featured environments with your stack, on demand and collaborate live.
          </p>
          <Button icon="mission" iconPosition="right" className="mt-2" size={1.5}>
            Get Started
          </Button>
        </section>
        <section className={classes.display}>
          <Marquee elements={[<Image path="../../../assets/icons/deno.svg" alt="Deno" asset />]} />
        </section>
        <section className={classes.features}></section>
        <section className={classes.templates}></section>
        {/*
        <br />
        {authStatus === AuthStatus.SIGNED_OUT && <Link to="/auth">Sign In</Link>}
        {authStatus === AuthStatus.SIGNED_IN && (
          <>
            <button onClick={handleSignOut}>Sign Out</button>
            <button onClick={handleDashboard}>Dashboard</button>
          </>
        )}
        {authStatus === AuthStatus.PENDING && <span>...</span>} */}
      </main>
      <Footer>
        <Logo />
        <Link to="https://github.com/bhagatsaurabh/hide-server" icon="github" iconProps={{ size: 1.25 }} />
      </Footer>
    </>
  );
};
