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
import Features from "@/components/Features/Features";
import Usecases from "@/components/Usecases/Usecases";
import Templates from "@/components/Templates/Templates";
import { useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import { useNavigate } from "react-router";
import { selectTemplates } from "@/store/env";

export const Home = () => {
  const bodyRef = useRef<HTMLElement>(null);
  const status = useAppSelector(selectStatus);
  const navigate = useNavigate();
  const templates = useAppSelector(selectTemplates);

  const handleAction = () => {
    if (status === AuthStatus.INCOMPLETE_PROFILE) {
      navigate("/auth/profile");
    } else if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

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
          <Button
            icon="mission"
            iconProps={{ "data-position": "right", asset: true }}
            className="mt-2"
            size={1.5}
            onClick={handleAction}
          >
            {status === AuthStatus.SIGNED_OUT ? "Get Started" : "Dashboard"}
          </Button>
        </section>
        <section className={classes.display}>
          <Marquee
            Component={Image}
            className="var-w-5 sm:var-w-6 md:var-w-7"
            spacing={2}
            props={templates
              .map((template) => ({
                ...template,
                path: `../../../assets/icons/${template.image.substring(template.image.lastIndexOf("-") + 1)}.svg`,
                alt: template.name,
                className: "w-5 h-4 sm:w-6 sm:h-4p8 md:w-7 md:h-5p6 of-contain",
                asset: true,
              }))
              .slice(1)}
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
        <Link
          to="https://github.com/bhagatsaurabh/hide-server"
          icon="github"
          iconProps={{ size: 1.25, asset: true }}
        />
      </Footer>
    </>
  );
};
