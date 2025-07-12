import { WorkspaceDTO } from "@/models/workspace";
import classes from "./WorkspaceList.module.css";
import Icon from "../common/Icon/Icon";
import { imageToIcon } from "@/utils/constants";
import { useAppSelector } from "@/hooks/store";
import { selectUid } from "@/store/auth";
import { ReactNode } from "react";
import Image from "../common/Image/Image";
import { useNavigate } from "react-router";

interface WorkspaceListProps {
  workspaces: WorkspaceDTO[];
  children: ReactNode;
}

const WorkspaceList = ({ workspaces, children }: WorkspaceListProps) => {
  const uid = useAppSelector(selectUid);
  const navigate = useNavigate();

  const handleSelectWorkspace = (uuid: string) => {
    navigate(`/dashboard/${uuid}`);
  };

  if (!workspaces.length) {
    return <>{children}</>;
  }

  return (
    <ul className={classes.list}>
      {workspaces.map((workspace) => (
        <li key={workspace.id}>
          <button onClick={() => handleSelectWorkspace(workspace.uuid)}>
            <div>
              <div>
                <div className={classes.heading}>
                  <Icon name={imageToIcon[workspace.image]} />
                  <span className={classes.name}>{workspace.name}</span>
                </div>
                <div className={classes.type}>{workspace.memberships.length > 1 && <span>Shared</span>}</div>
                <div className={classes.desc}>{workspace.description}</div>
              </div>
            </div>
            <div className={classes.footer}>
              <span className={classes.role}>
                {workspace.memberships.find((membership) => membership.userId === uid)?.role === "member"
                  ? "Member"
                  : "Owner"}
              </span>
              <div className={classes.members}>
                {workspace.memberships.map((membership) => (
                  <Image
                    key={membership.userId}
                    path={membership.picture || "../../../assets/icons/guest.svg"}
                    alt="member avatar"
                    asset={!membership.picture}
                    className="w-1p5 h-1p5 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain"
                  />
                ))}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default WorkspaceList;
