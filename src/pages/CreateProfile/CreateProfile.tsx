import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { AuthStatus, createProfile, selectPicture, selectStatus } from "@/store/auth";
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
    await dispatch(createProfile({ name, username, picture })).unwrap();
  };

  return <Profile action="create" profile={{ picture }} save={handleContinue} />;
};

export default CreateProfile;
