import { publicApi } from "@/config/axios";
import { VerifyEmailDTO } from "@/models/auth";
import { UsernameAvailabilityDTO } from "@/models/user";

export const checkUsername = async (username: string) => {
  return await publicApi.get<UsernameAvailabilityDTO>("/check-username", {
    params: {
      username,
    },
  });
};

export const registerEmail = async (email: string) => {
  return await publicApi.get("/register-email", { data: { email } });
};

export const verifyEmail = async (email: string, pin: string) => {
  return await publicApi.post<unknown, unknown, VerifyEmailDTO>("/verify-email", { email, pin });
};
