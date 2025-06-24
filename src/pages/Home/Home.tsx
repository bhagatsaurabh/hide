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
import templates from "@/assets/templates.json";
import Features from "@/components/Features/Features";
import Usecases from "@/components/Usecases/Usecases";
import Templates from "@/components/Templates/Templates";

export const Home = () => {
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
        bodyRef={bodyRef}
      />
      <main>
        <section ref={bodyRef} className={classes.section}>
          <p className={[classes.heading, "mb-n0p5"].join(" ")}>Cloud</p>
          <p className={[classes.heading, "fw-500"].join(" ")}>Workspaces</p>
          <p className={[classes.heading, "fs-1p75"].join(" ")}>That. Just. Work.</p>
          <p className={classes.subheading}>
            Provision full-featured environments with your stack, on demand and ready to collaborate live within
            seconds.
          </p>
          <Button icon="mission" iconProps={{ "data-position": "right" }} className="mt-2" size={1.5}>
            Get Started
          </Button>
        </section>
        <section className={classes.display}>
          <Marquee
            Component={Image}
            className="var-w-5 sm:var-w-7p5 md:var-w-10"
            spacing={2}
            props={templates.map((template) => ({
              ...template,
              className: "w-5 h-4 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain",
              asset: true,
            }))}
            height={9}
          />
        </section>
        <section className={classes.features}>
          <Features />
        </section>
        <section className={classes.usecases}>
          <Usecases />
        </section>
        <section className={classes.templates}>
          <Templates />
        </section>
      </main>
      <Footer>
        <Logo />
        <Link to="https://github.com/bhagatsaurabh/hide-server" icon="github" iconProps={{ size: 1.25 }} />
      </Footer>
    </>
  );
};
