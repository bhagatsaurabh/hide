import { useState } from "react";
import Search from "../common/Search/Search";
import classes from "./AddMembers.module.css";
import Spinner from "../common/Spinner/Spinner";
import { search } from "@/services/user";
import { User, UserSearchHits } from "@/models/user";
import { useAppDispatch } from "@/hooks/store";
import { notify } from "@/store/notifications";
import Image from "../common/Image/Image";
import { WorkspaceDTO } from "@/models/workspace";
import Button from "../common/Button/Button";
import PillGroup, { Pill } from "../common/PillGroup/PillGroup";
import { updateWorkspace } from "@/services/workspace";
import { fetchWorkspaces } from "@/store/workspace";

interface AddMembersProps {
  workspace: WorkspaceDTO;
  onBack: () => void;
}

const AddMembers = ({ workspace, onBack }: AddMembersProps) => {
  const [hits, setHits] = useState<UserSearchHits[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [added, setAdded] = useState<Map<string, Pill>>(new Map());
  const dispatch = useAppDispatch();
  const existing = new Set(workspace.memberships.map((member) => member.userId));
  const [invBusy, setInvBusy] = useState(false);

  const handleSearch = async (query: string) => {
    setHits(null);
    setBusy(true);
    try {
      const res = await search(query, page);
      setPage(res.data.page);
      setBusy(false);
      setHits(res.data.data);
    } catch (error) {
      console.log(error);
      dispatch(
        notify({ title: "Something went wrong, please try again", message: "Cannot search users", status: "error" })
      );
    } finally {
      setBusy(false);
    }
  };
  const handleAdd = (user: User) => {
    setAdded((prev) => {
      const updated = new Map(prev);
      updated.set(user.uid, { id: user.uid, image: user.picture, text: user.username });
      return updated;
    });
  };
  const handleRemove = (pill: Pill) => {
    setAdded((prev) => {
      const updated = new Map(prev);
      updated.delete(pill.id as string);
      return updated;
    });
  };
  const handleInvite = async () => {
    setInvBusy(true);
    const updatedMembers = new Set(workspace.memberships.map((member) => member.userId));
    added.forEach((member) => updatedMembers.add(member.id as string));
    await updateWorkspace({
      id: workspace.id,
      description: workspace.description,
      name: workspace.name,
      members: [...updatedMembers],
    });
    await dispatch(fetchWorkspaces());
    setInvBusy(false);
    onBack();
  };

  const getAction = (hit: UserSearchHits) => {
    if (existing.has(hit.doc.uid)) {
      return (
        <div className={classes.extra}>
          <span>Member</span>
        </div>
      );
    }
    if (added.has(hit.doc.uid)) {
      return (
        <div className={classes.extra}>
          <span>Added</span>
        </div>
      );
    }
    return (
      <Button className="py-0p25 px-0p75" onClick={() => handleAdd(hit.doc)} size={1.2} type="primary">
        Add
      </Button>
    );
  };

  let centered = true;
  let result = <span>Search users by name or username</span>;
  if (busy) {
    result = <Spinner size={1.5}>Searching</Spinner>;
  }
  if (hits) {
    if (hits.length === 0) {
      result = <span>Found no users matching your query</span>;
    } else {
      centered = false;
      result = (
        <ul className={[classes.list, "scroll-shadows"].join(" ")}>
          {hits.map((hit) => (
            <li key={hit.doc.uid}>
              <div className={classes.info}>
                <div className={classes.identity}>
                  <Image
                    className="p-0p35 w-3 h-3 sm:w-7p5 sm:h-6 md:w-10 md:h-8 of-contain br-5t"
                    path={hit.doc.picture || "../../../assets/icons/guest.svg"}
                    alt={hit.doc.name}
                    asset={!hit.doc.picture}
                  />
                  <div className={classes.details}>
                    <span className={classes.name}>{hit.doc.name}</span>
                    <span className={classes.username}>@{hit.doc.username}</span>
                  </div>
                </div>
              </div>
              <div className={classes.action}>{getAction(hit)}</div>
            </li>
          ))}
        </ul>
      );
    }
  }

  return (
    <>
      <h2 className={classes.heading}>Add members to {workspace.name}</h2>
      <Search onSearch={handleSearch} placeholder="Find members" />
      <div className={[classes.result, centered ? "d-flex flex-center flex-column" : ""].join(" ")}>{result}</div>
      <div className={classes.selected}>
        <PillGroup pills={[...added.values()]} onRemove={handleRemove} />
      </div>
      <div className={classes.controls}>
        {added.size > 0 && (
          <Button icon="email" busy={invBusy} onClick={handleInvite}>
            Invite
          </Button>
        )}
        <Button onClick={onBack}>Back</Button>
      </div>
    </>
  );
};

export default AddMembers;
