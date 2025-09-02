import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, createProfile, selectPicture, selectStatus, setStatus } from "@/store/auth";
import { notify } from "@/store/notifications";
import { InternalNotificationPayload } from "@/models/notification";
import Profile from "@/components/Profile/Profile";

const CreateProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectStatus);
  const picture = useAppSelector(selectPicture);

  useEffect(() => {
    if (status === AuthStatus.SIGNED_IN) {
      navigate("/dashboard");
    }
  }, [navigate, status]);

  const handleContinue = async (name: string, username: string) => {
    const success = await dispatch(createProfile({ name, username, picture })).unwrap();
    if (success) {
      dispatch(setStatus(AuthStatus.SIGNED_IN));
    } else {
      dispatch(
        notify({
          message: "Profile creation failed, try again",
          status: "error",
          title: "Create profile",
        } as InternalNotificationPayload)
      );
    }
  };

  return <Profile action="create" profile={{ picture }} save={handleContinue} />;
};

export default CreateProfile;
