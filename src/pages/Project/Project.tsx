import { useLoaderData, useNavigate } from "react-router";
import { workspaceLoader } from "@/router/guards";

export const Project = () => {
  const workspace = useLoaderData<typeof workspaceLoader>();
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/env/${workspace.uuid}`);
  };

  return (
    <>
      <div>
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
      <button onClick={handleOpen}>Open</button>
    </>
  );
};
