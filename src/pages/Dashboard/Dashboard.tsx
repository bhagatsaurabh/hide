import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutlet } from "react-router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/store";
import { fetchWorkspaces, selectRecent, selectWorkspaces } from "@/store/workspace";
import { NotificationBar } from "@/components/Notifications/Notifications";
import Header from "@/components/common/Header/Header";
import Logo from "@/components/common/Logo/Logo";
import Spinner from "@/components/common/Spinner/Spinner";
import classes from "./Dashboard.module.css";
import Avatar from "@/components/common/Avatar/Avatar";
import Button from "@/components/common/Button/Button";
import Icon from "@/components/common/Icon/Icon";
import CardSkeleton from "@/components/common/skeletons/CardSkeleton/CardSkeleton";
import WorkspaceList from "@/components/WorkspaceList/WorkspaceList";
import { AnimatePresence, motion } from "motion/react";
import { socket } from "@/config/socket";
import { WorkspaceMembersModified } from "@/models/workspace";

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, connected } = useSelector(selectWorkspaces);
  const recent = useSelector(selectRecent);
  const [busy, setBusy] = useState(true);
  const bodyRef = useRef<HTMLHeadingElement>(null);
  const outlet = useOutlet();

  const init = useCallback(async () => {
    setBusy(true);
    await dispatch(fetchWorkspaces());
    setBusy(false);
  }, [dispatch]);

  useEffect(() => {
    socket?.on("workspace", (msg) => {
      if (msg.action === "members.modified") {
        handleMembersModified(msg.payload);
      }
    });

    return () => {
      socket?.off("workspace");
    };
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleCreate = () => {
    navigate("/dashboard/new");
  };
  const handleMembersModified = async (_data: WorkspaceMembersModified) => {
    console.log(_data);
    await dispatch(fetchWorkspaces());
  };

  return (
    <>
      <Header
        left={<Logo />}
        right={
          <>
            <Button className="px-0p5 py-0p25 mx-0p25" type="secondary" onClick={handleCreate} size={1.1}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="plus" size={1} className="mr-0p25" />
                <span>New</span>
              </div>
            </Button>
            <NotificationBar />
            <Avatar />
          </>
        }
        bodyRef={bodyRef}
      />
      <main className={classes.wrapper}>
        {!connected ? (
          <section className={[classes.section, classes.wait].join(" ")}>
            <Spinner ref={bodyRef} size={2} />
          </section>
        ) : (
          <>
            {recent.length ? (
              <section className={classes.wlist}>
                <h1 ref={bodyRef}>Recently opened</h1>
                {busy ? (
                  <CardSkeleton style={{ height: "12rem" }} />
                ) : (
                  <WorkspaceList workspaces={recent}>
                    <h2 className={classes.norecent}>Nothing in recent</h2>
                  </WorkspaceList>
                )}
              </section>
            ) : null}
            <section className={classes.wlist}>
              <h1 ref={!recent.length ? bodyRef : null}>All Workspaces</h1>
              {busy ? (
                <CardSkeleton style={{ height: "12rem" }} />
              ) : (
                <WorkspaceList workspaces={workspaces}>
                  <div className={classes.noworkspace}>
                    <h2>No workspaces</h2>
                    <Button onClick={handleCreate} icon="plus" size={1.15} type="secondary">
                      Create your first workspace
                    </Button>
                  </div>
                </WorkspaceList>
              )}
            </section>
          </>
        )}
      </main>
      <AnimatePresence mode="popLayout">
        {outlet && (
          <motion.aside
            className={classes.popup}
            key={location.pathname}
            initial={{ opacity: 0, transform: "scale(0.96)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.96)" }}
            transition={{ duration: 0.15 }}
          >
            {outlet}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
