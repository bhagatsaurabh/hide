import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/store";
import { fetchWorkspaces, selectWorkspaces, setConnected } from "@/store/workspace";
import { connectSocket } from "@/config/socket";

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, connected } = useSelector(selectWorkspaces);

  const init = useCallback(async () => {
    await connectSocket();
    dispatch(setConnected(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchWorkspaces());
    init();
  }, [dispatch, init]);

  const handleCreate = () => {
    navigate("/dashboard/new");
  };
  const handleSelectWorkspace = (uuid: string) => {
    navigate(`/dashboard/${uuid}`);
  };

  return (
    <>
      <div>{"Dashboard"}</div>
      {!connected ? (
        "Loading..."
      ) : (
        <>
          {workspaces.map((workspace) => (
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
          ))}
        </>
      )}
      <div>
        <button onClick={handleCreate}>{"Create Workspace"}</button>
      </div>
      <Outlet />
    </>
  );
};
