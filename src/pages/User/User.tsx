import Profile from "@/components/Profile/Profile";
import classes from "./User.module.css";
import { useAppSelector } from "@/hooks/store";
import { selectName, selectPicture, selectUsername } from "@/store/auth";

const User = () => {
  const name = useAppSelector(selectName);
  const username = useAppSelector(selectUsername);
  const picture = useAppSelector(selectPicture);
  const handleSave = async (name: string, username: string) => {
    console.log(name, username);
    // TODO
  };

  return <Profile action="edit" save={handleSave} profile={{ name, username, picture }} />;
};

export default User;
