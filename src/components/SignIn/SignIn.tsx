import { useLocation } from "react-router";
import AnonymousProvider from "../auth/AnonymousProvider/AnonymousProvider";
import { usePrevious } from "@/hooks/prev";

const SignIn = () => {
  const location = useLocation();
  const signInType = usePrevious(location.state?.signInType);

  return signInType === "guest" && <AnonymousProvider />;
};

export default SignIn;
