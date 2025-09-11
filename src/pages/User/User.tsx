import Profile from "@/components/Profile/Profile";
import classes from "./User.module.css";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { selectName, selectPicture, selectUsername, updateProfile } from "@/store/auth";
import { notify } from "@/store/notifications";
import { InternalNotificationPayload } from "@/models/notification";

const User = () => {
  const name = useAppSelector(selectName);
  const username = useAppSelector(selectUsername);
  const picture = useAppSelector(selectPicture);
  const dispatch = useAppDispatch();

  const handleSave = async (name: string, username: string) => {
    const success = await dispatch(updateProfile({ name, username, picture })).unwrap();
    if (!success) {
      dispatch(
        notify({
          status: "error",
          title: "Update profile",
          message: "Profile update failed, try again",
        } as InternalNotificationPayload)
      );
    }
  };

  return <Profile action="edit" save={handleSave} profile={{ name, username, picture }} />;
};

export default User;
