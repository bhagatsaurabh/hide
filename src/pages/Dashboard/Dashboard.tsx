import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/store";
import { fetchWorkspaces, selectWorkspaces } from "@/store/workspace";
import { NotificationBar } from "@/components/Notifications/Notifications";
import Header from "@/components/common/Header/Header";
import Logo from "@/components/common/Logo/Logo";
import Spinner from "@/components/common/Spinner/Spinner";
import classes from "./Dashboard.module.css";
import Avatar from "@/components/common/Avatar/Avatar";
import Button from "@/components/common/Button/Button";
import Icon from "@/components/common/Icon/Icon";

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, connected } = useSelector(selectWorkspaces);
  const bodyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreate = () => {
    navigate("/dashboard/new");
  };
  const handleSelectWorkspace = (uuid: string) => {
    navigate(`/dashboard/${uuid}`);
  };

  return (
    <>
      <Header
        left={<Logo />}
        right={
          <>
            <Button className="px-0p5 py-0p25" type="secondary" onClick={handleCreate} size={1.1}>
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
      <main>
        {!connected ? (
          <section className={[classes.section, classes.wait].join(" ")} ref={bodyRef}>
            <Spinner size={2} />
          </section>
        ) : (
          workspaces.map((workspace) => (
            <div key={workspace.id} onClick={() => handleSelectWorkspace(workspace.uuid)}>
              <h2>{workspace.name}</h2>
              <h4>{workspace.uuid}</h4>
              <h3>{workspace.description}</h3>
              <h5>{workspace.createdAt}</h5>
              <ul>
                {workspace.memberships.map((membership) => (
                  <li key={membership.userId}>
                    <h5>
                      {membership.username}:{membership.role}:{membership.joinedAt}
                    </h5>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </main>
      <Outlet />
    </>
  );
};
