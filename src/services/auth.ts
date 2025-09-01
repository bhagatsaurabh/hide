import { publicApi } from "@/config/axios";
import { RegisterEmailDTO, VerifyEmailDTO } from "@/models/auth";
import { UsernameAvailabilityDTO } from "@/models/user";
import { AxiosResponse } from "axios";

export const checkUsername = async (username: string) => {
  return await publicApi.get<UsernameAvailabilityDTO>("/check-username", {
    params: {
      username,
    },
  });
};

export const registerEmail = async (email: string) => {
  return await publicApi.post<unknown, AxiosResponse<unknown>, RegisterEmailDTO>("/register-email", { email });
};

export const verifyEmail = async (email: string, code: string) => {
  return await publicApi.post<{ token: string }, AxiosResponse<{ token: string }>, VerifyEmailDTO>("/verify-email", {
    email,
    code,
  });
};
