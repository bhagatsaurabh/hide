import { MembershipDTO } from "@/models/workspace";
import classes from "./MemberList.module.css";
import Button from "../common/Button/Button";
import { capitalize } from "@/utils";
import Image from "../common/Image/Image";

interface MemberListProps {
  members: MembershipDTO[];
  role: "owner" | "member";
  onRemove: (user: MembershipDTO) => void;
}

const MemberList = ({ members, onRemove, role }: MemberListProps) => {
  return (
    <ul className={classes.memberlist}>
      {members.map((member) => (
        <li key={member.userId} className={classes.memberitem}>
          <div className={classes.info}>
            <div className={classes.identity}>
              <Image
                className="p-0p35 w-3 h-3 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain br-5t"
                path={member.picture || "../../../assets/icons/guest.svg"}
                alt={member.name}
                asset={!member.picture}
              />
              <div className={classes.details}>
                <span className={classes.name}>{member.name}</span>
                <span className={classes.username}>@{member.username}</span>
              </div>
            </div>
          </div>
          <div className={classes.action}>
            {member.role !== "owner" && role === "owner" ? (
              <Button
                icon="close"
                iconProps={{ "data-position": "right" }}
                className="py-0p5 px-0p75"
                onClick={() => onRemove(member)}
                size={1.2}
                type="tertiary"
              >
                Remove
              </Button>
            ) : (
              <div className={classes.extra}>
                <span>{capitalize(member.role)}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MemberList;
