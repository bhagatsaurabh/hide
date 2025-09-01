import { useLocation } from "react-router";
import AnonymousProvider from "../auth/AnonymousProvider/AnonymousProvider";
import { usePrevious } from "@/hooks/prev";
import { ReactNode } from "react";
import EmailProvider from "../auth/EmailProvider/EmailProvider";
import { AuthType } from "@/store/auth";

const providerMap: Record<AuthType, ReactNode> = {
  guest: <AnonymousProvider />,
  email: <EmailProvider />,
  github: null,
  google: null,
  microsoft: null,
};

const SignIn = () => {
  const location = useLocation();
  const signInType = usePrevious<AuthType>(location.state?.signInType);

  return providerMap[signInType] ?? null;
};

export default SignIn;
