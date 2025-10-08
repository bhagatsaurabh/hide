import { useEffect } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router";
import { useAppSelector } from "@/hooks/store";
import { AuthStatus, selectStatus } from "@/store/auth";
import classes from "./Auth.module.css";
import Image from "@/components/common/Image/Image";
import { AnimatePresence, motion } from "motion/react";
import Spinner from "@/components/common/Spinner/Spinner";

export const Auth = () => {
  const navigate = useNavigate();
  const status = useAppSelector(selectStatus);
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    } else if (status === AuthStatus.INCOMPLETE_PROFILE) {
      navigate("/auth/profile");
    }
  }, [navigate, status]);

  return (
    <>
      <main className={classes.auth}>
        <section className={classes.logo}>
          <Image
            style={{ color: "#ffffff" }}
            className="w-7 h-4 of-contain"
            path="logo-compact"
            alt="H-IDE logo"
            asset
            icon
          />
        </section>
        {status === AuthStatus.PENDING ? (
          <Spinner size={2.5} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.section
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {outlet}
            </motion.section>
          </AnimatePresence>
        )}
        <section></section>
      </main>
    </>
  );
};
