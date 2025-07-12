import { MembershipDTO } from "@/models/workspace";
import classes from "./MemberList.module.css";
import Button from "../common/Button/Button";
import { capitalize } from "@/utils";

interface MemberListProps {
  members: MembershipDTO[];
  onRemove: (uid: string) => void;
}

const MemberList = ({ members, onRemove }: MemberListProps) => {
  return (
    <ul className={classes.memberlist}>
      {members.map((member) => (
        <li key={member.userId}>
          <div className={classes.info}>
            <div className={classes.identity}></div>
            <div className={classes.extra}>
              <span>{capitalize(member.role)}</span>
            </div>
          </div>
          <div className={classes.action}>
            <Button onClick={() => onRemove(member.userId)} size={1.2} type="secondary">
              Remove
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MemberList;
