import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/store";
import { fetchWorkspaces, selectWorkspaces } from "@/store/workspace";
import { State } from "@/utils/types";

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, state } = useSelector(selectWorkspaces);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreate = () => {
    navigate("/dashboard/new");
  };

  return (
    <>
      <div>{"Dashboard"}</div>
      {state === State.PENDING ? "Loading..." : workspaces}
      <div>
        <button onClick={handleCreate}>{"Create Workspace"}</button>
      </div>
      <Outlet />
    </>
  );
};
