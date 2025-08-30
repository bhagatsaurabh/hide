import { useLocation } from "react-router";
import AnonymousProvider from "../auth/AnonymousProvider/AnonymousProvider";
import { usePrevious } from "@/hooks/prev";
import { JSX } from "react";
import EmailProvider from "../auth/EmailProvider/EmailProvider";

export type ProviderType = "guest" | "email";
const providerMap: Record<ProviderType, JSX.Element> = {
  guest: <AnonymousProvider />,
  email: <EmailProvider />,
};

const SignIn = () => {
  const location = useLocation();
  const signInType = usePrevious<ProviderType>(location.state?.signInType);

  return providerMap[signInType] ?? null;
};

export default SignIn;
