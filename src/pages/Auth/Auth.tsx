import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, AuthType, selectStatus, signIn } from "@/store/auth";
import classes from "./Auth.module.css";
import Image from "@/components/common/Image/Image";
import { AnimatePresence, motion } from "motion/react";

export const Auth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectStatus);
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    } else if (status === AuthStatus.INCOMPLETE_PROFILE) {
      navigate("/complete-profile");
    }
  }, [navigate, status]);

  const handleContinue = async () => {
    setBusy(true);
    await dispatch(signIn({ type: AuthType.GUEST }));
    setBusy(false);
  };

  return (
    <>
      <main className={classes.auth}>
        <section className={classes.logo}>
          <Image
            style={{ color: "#ffffff" }}
            className="w-7 h-4 of-contain"
            path="../../../assets/icons/logo-compact.svg"
            alt="H-IDE logo"
            asset
          />
        </section>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, transform: "scale(0.96)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.96)" }}
            transition={{ duration: 0.15 }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
        <section></section>
      </main>
    </>
  );
};
